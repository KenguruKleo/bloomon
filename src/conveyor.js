class Conveyor {
  constructor(_cb) {
    this._cb = _cb;
  }

  on(_cb) {
    this._cb = _cb;
  }

  enter(data) {
    console.log(`received: ${data}`);
    setTimeout(() => this.exit(`return: ${data}`), 1000);
  }

  exit(data) {
    if (this._cb) {
      this._cb(data);
    }
  }
}

module.exports = Conveyor;
