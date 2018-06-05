const constants = require('./constants');
const { getSpec } = require('../utils/specification');

class Conveyor {
  constructor(_cb, { verbose = true } = {}) {
    this.verbose = verbose;
    this._cb = _cb;
    this.specifications = [];
  }

  on(_cb) {
    this._cb = _cb;
  }

  execute(data) {
    return new Promise(done => {
      if (data.length > 2) {
        this.upsertSpecification(data);
        done(`Result: ${JSON.stringify(this.specifications)}`);
      } else {
        done('');
      }
    });
  }

  upsertSpecification(data) {
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
    const result = await this.execute(data);
    if (result) {
      this.output(result);
    } else {
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
