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

  async enter(data) {
    process.stdout.write(`received: ${data}`);
    const result = await Conveyor.execute(data);
    if (result) {
      this.exit(result);
    } else {
      this.exit(constants.LOOP);
    }
    // setTimeout(() => this.exit(data), this._delay);
    // this.exit(`return: ${data}`);
  }

  exit(data) {
    if (this._cb) {
      this._cb(data);
    }
  }
}

module.exports = Conveyor;
