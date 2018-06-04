const net = require('net');

class WorkerClient {
  constructor({ host, port }) {
    this.host = host;
    this.port = port;
    this.ready = false;

    this.client = net.connect({ host: this.host, port: this.port }, () => {
      console.log('Connected to %s:%d\n', this.host, this.port);

      this.client.setNoDelay(true);
      this.ready = true;

      this.client.on('data', data => {
        this.output(data);
        this.ready = true;
      });

      this.client.on('close', () =>
        console.log(`\nconnection closed by foreign host: ${this.host}, port: ${this.port}.\n`));
    });
  }

  on(_cb) {
    this._cb = _cb;
  }

  close() {
    if (this.client) {
      console.log(`\nconnection closed by close request: ${this.host}, port: ${this.port}.\n`);
      this.client.end();
    }
  }

  input(data) {
    this.ready = false;
    this.client.write(data);
  }

  output(data) {
    if (this._cb) {
      this._cb(data);
    }
  }
}

module.exports = WorkerClient;
