const readline = require('readline');
const Client = require('./client');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const worker1Connect = { host: '0.0.0.0', port: 8001 };
const worker2Connect = { host: '0.0.0.0', port: 8002 };

const clientWorker1 = new Client(worker1Connect);
const clientWorker2 = new Client(worker2Connect);

clientWorker1.on(data => console.log(`Received from W1: ${data}`));
clientWorker2.on(data => console.log(`Received from W2: ${data}`));

rl.on('line', input => {
  clientWorker1.enter(`send to W1: ${input}`);
  clientWorker2.enter(`send to W2: ${input}`);
});

const finish = () => {
  console.log('\nending session\n');
  rl.close();

  // close connection
  clientWorker1.close();
  clientWorker2.close();
};

rl.on('SIGINT', finish);
process.on('SIGINT', finish);
process.on('SIGTERM', finish);
