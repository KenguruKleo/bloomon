const { WorkerClient, constants } = require('./worker');
const { processingStream, switcher } = require('./controller');

const getWorkers = () => {
  const worker1Connect = { host: '0.0.0.0', port: 8001 };
  const worker2Connect = { host: '0.0.0.0', port: 8002 };

  const clientWorker1 = new WorkerClient(worker1Connect);
  const clientWorker2 = new WorkerClient(worker2Connect);

  return {
    small: clientWorker1,
    large: clientWorker2,
  };
};

const outputData = workerName => data => { // eslint-disable-line
  switch (data.toString()) {
    case constants.LOOP:
      return;
    default:
      // process.stdout.write(`Received from ${workerName}: [${data}]\n`);
      process.stdout.write(`${data}\n`);
  }
};

const main = async () => {
  const workers = getWorkers();
  workers.small.on(outputData('W1'));
  workers.large.on(outputData('W2'));

  return processingStream(process.stdin, workers, switcher);
};

module.exports = main;

if (!module.parent) {
  main();
}
