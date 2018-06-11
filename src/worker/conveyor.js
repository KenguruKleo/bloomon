const constants = require('./constants');
const Store = require('./store');
const {
  getSpec,
  getFlower,
  isSpecification,
  isFlower,
  getResultBouquet,
} = require('../utils/specification');
const Simplex = require('simplex-solver');

class Conveyor {
  constructor(_cb, { verbose = true, flowersBufferSize = 256 } = {}) {
    this.verbose = verbose;
    this.flowersBufferSize = flowersBufferSize;
    this._cb = _cb;
    this.specifications = [];
    this.flowersStore = new Store();
    this.dataProcessors = [
      { matcher: isSpecification, processor: this.processSpecification },
      { matcher: isFlower, processor: this.processFlower },
    ];
  }

  on(_cb) {
    this._cb = _cb;
  }

  execute(data) {
    return new Promise(done => {
      const { processor } = this.dataProcessors.find(({ matcher }) => matcher(data)) || {};
      if (processor) {
        processor.bind(this)(data);
      }

      if (data === constants.END_INPUT) {
        let bouquet = true;
        const result = [];
        while (bouquet) {
          bouquet = this.processCreatingBouquet();
          if (bouquet) result.push(bouquet);
        }
        result.push(`Store: ${JSON.stringify(this.flowersStore)}`);
        done(result.join('\n'));
      } else if (this.flowersStore.getItemsCount() >= this.flowersBufferSize) {
        done(this.processCreatingBouquet());
      } else {
        done(null);
      }
    });
  }

  static getSpecMandatoryItem(spec, id) {
    return spec.mandatory.find(item => id === item.id) || { id, quantity: 0 };
  }

  static findMatchedSpec(specifications, flowersStore) {
    // create constraints for simplex method
    const constraints = Object.keys(flowersStore.items)
      .map(flowerId => (
        specifications // eslint-disable-line
          .map(spec => `${Conveyor.getSpecMandatoryItem(spec, flowerId).quantity}${spec.id}`)
          .join(' + ')
        + ` + ${flowerId} `
        + ' <= ' + flowersStore.items[flowerId]
      ));
    // add total constraints
    constraints.push(`${
      specifications.map(spec => `${spec.total}${spec.id}`).join(' + ')
    } <= ${flowersStore.total}`);
    // target function
    const equation = specifications.map(({ id }) => id).join(' + ');

    const solution = Simplex.maximize(equation, constraints);

    // console.log(equation);
    // console.log(constraints);
    // console.log(specifications.map(({ id }) => `${id}=${solution[id]}`).join(', '));

    const remain = Object.keys(flowersStore.items)
      .map(flowerId => {
        const remainQuantity = specifications
          .reduce(
            (acc, spec) => acc - (Conveyor.getSpecMandatoryItem(spec, flowerId).quantity * solution[spec.id]),
            flowersStore.items[flowerId],
          );
        return { id: flowerId, quantity: remainQuantity };
      });
    const totalRemain = remain.reduce((acc, { quantity }) => acc + quantity, 0);
    // console.log(`Remain: ${JSON.stringify(remain)}, totalRemain: ${totalRemain}`);
    const recommendedDistribution = remain
      .map(({ id, quantity }) => ({ id, proportion: totalRemain ? quantity / totalRemain : 0 }));

    const result = specifications.reduce((acc, spec) => {
      if (solution[spec.id] > acc.max) {
        return { max: solution[spec.id], spec };
      }
      return acc;
    }, { max: solution[specifications[0].id], spec: specifications[0] })
      .spec;
    if (flowersStore.checkQuantityBySpec(result)) {
      return { spec: result, recommendedDistribution };
    }
    return null;

    // const result = specifications
    //   .find(specification => flowersStore.checkQuantityBySpec(specification));
    // return result;
  }

  processCreatingBouquet() {
    console.log(JSON.stringify(this.flowersStore));

    const matchedSpec = Conveyor.findMatchedSpec(this.specifications, this.flowersStore);

    if (matchedSpec) {
      const { spec, recommendedDistribution } = matchedSpec;
      const subCount = this.flowersStore.sub(spec.mandatory);

      const stockFlowersDistribution = recommendedDistribution || this.flowersStore.getStockItemDistribution();
      const additionalFlowers = Store.getDistributedItems(spec.total - subCount, stockFlowersDistribution);
      this.flowersStore.sub(additionalFlowers);

      const bouquet = getResultBouquet(spec, additionalFlowers);
      return bouquet;
    }
    return null;
  }

  processFlower(data) {
    this.flowersStore.add([getFlower(data)]);
  }

  processSpecification(data) {
    const spec = getSpec(data);
    const foundInx = this.specifications.findIndex(({ id }) => id === spec.id);
    if (foundInx >= 0) {
      // update specification
      this.specifications[foundInx] = spec;
    } else {
      this.specifications.push(spec);
    }
  }

  async input(data) {
    if (this.verbose) {
      // process.stdout.write(`received: (${data})\n`);
    }
    try {
      const result = await this.execute(data);
      if (result) {
        this.output(result);
      } else {
        this.output(constants.LOOP);
      }
    } catch (e) {
      console.error(e);
      this.output(constants.LOOP);
    }
  }

  output(data) {
    if (this._cb) {
      this._cb(data);
    }
  }
}

module.exports = Conveyor;
