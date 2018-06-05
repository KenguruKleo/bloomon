const constants = require('./constants');

class Conveyor {
  constructor(_cb) {
    this._cb = _cb;
  }

  on(_cb) {
    this._cb = _cb;
  }

  static execute(data) {
    return new Promise(done => {
      if (data.length > 2) {
        done(`Result: ${data}`);
      } else {
        done('');
      }
    });
  }

  async input(data) {
    process.stdout.write(`received: (${data})\n`);
    const result = await Conveyor.execute(data);
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
