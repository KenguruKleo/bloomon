const net = require('net');

class Client {
  constructor({ host, port }) {
    this.host = host;
    this.port = port;
    this.client = net.connect({ host: this.host, port: this.port }, () => {
      console.log('Connected to %s:%d\n', this.host, this.port);

      this.client.on('data', data => this.exit(data));

      this.client.on('close', () =>
        console.log(`\nconnection closed by foreign host: ${this.host}, port: ${this.port}.\n`));
    });
  }

  on(_cb) {
    this._cb = _cb;
  }

  close() {
    if (this.client) {
      this.client.end();
    }
  }

  enter(data) {
    this.client.write(data);
  }

  exit(data) {
    if (this._cb) {
      this._cb(data);
    }
  }
}

module.exports = Client;
