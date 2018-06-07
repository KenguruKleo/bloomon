const constants = require('./constants');
const Store = require('./store');
const {
  getSpec,
  getFlower,
  isSpecification,
  isFlower,
} = require('../utils/specification');

class Conveyor {
  constructor(_cb, { verbose = true } = {}) {
    this.verbose = verbose;
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

      const result = this.processCreatingBouquet();
      done(result);
    });
  }

  processCreatingBouquet() {
    const matchedSpec = this.specifications
      .find(specification => this.flowersStore.checkQuantityBySpec(specification));

    if (matchedSpec) {
      const subCount = this.flowersStore.sub(matchedSpec.mandatory);

      const stockFlowersDistribution = this.flowersStore.getStockItemDistribution();
      const additionalFlowers = Store.getDistributedItems(matchedSpec.total - subCount, stockFlowersDistribution);
      this.flowersStore.sub(additionalFlowers);

      // return matchedSpec.name;
      return `${matchedSpec.name}, a: ${JSON.stringify(additionalFlowers)}, st: ${JSON.stringify(this.flowersStore)}`;
    }
    // return `store: ${JSON.stringify(this.flowersStore)}`;
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
      process.stdout.write(`received: (${data})\n`);
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
