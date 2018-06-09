const constants = require('./constants');
const Store = require('./store');
const {
  getSpec,
  getFlower,
  isSpecification,
  isFlower,
  getResultBouquet,
} = require('../utils/specification');

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

  static findMatchedSpec(specifications, flowersStore) {
    return specifications
      .find(specification => flowersStore.checkQuantityBySpec(specification));
  }

  processCreatingBouquet() {
    console.log(this.flowersStore.getItemsCount(), JSON.stringify(this.flowersStore));

    const matchedSpec = Conveyor.findMatchedSpec(this.specifications, this.flowersStore);

    if (matchedSpec) {
      const subCount = this.flowersStore.sub(matchedSpec.mandatory);

      const stockFlowersDistribution = this.flowersStore.getStockItemDistribution();
      const additionalFlowers = Store.getDistributedItems(matchedSpec.total - subCount, stockFlowersDistribution);
      this.flowersStore.sub(additionalFlowers);

      const bouquet = getResultBouquet(matchedSpec, additionalFlowers);
      // return `${matchedSpec.name}, bouquet: ${bouquet}`;
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
