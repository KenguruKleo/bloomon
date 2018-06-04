const Client = require('./worker-client');
const switcher = require('./switcher');
const constants = require('./constants');

let workers = {};

const worker1Connect = { host: '0.0.0.0', port: 8001 };
const worker2Connect = { host: '0.0.0.0', port: 8002 };

const clientWorker1 = new Client(worker1Connect);
const clientWorker2 = new Client(worker2Connect);

// const readyStatus = wks => `(S: ${wks.small.ready}, L: ${wks.large.ready})`;

const outputData = workerName => data => {
  switch (data.toString()) {
    case constants.LOOP:
      return;
    default:
      process.stdout.write(`Received from ${workerName}: [${data}]\n`);
  }
};

clientWorker1.on(outputData('W1'));
clientWorker2.on(outputData('W2'));

workers = {
  small: clientWorker1,
  large: clientWorker2,
};


const isWorkersReady = wks => (
  Object
    .values(wks)
    .every(worker => !!worker.ready)
);

const waitUntilFnReady = (fn, cb) => {
  if (fn()) {
    cb();
  } else {
    setTimeout(() => waitUntilFnReady(fn, cb), 0);
  }
};

const waitFn = fn => (
  new Promise(done => waitUntilFnReady(fn, done))
);

process.stdin.resume();

let inputRemain = '';
process.stdin.on('data', async rawInput => {
  const input = rawInput.toString();
  process.stdin.pause();

  const lines = (inputRemain + input).split(/\r?\n/);

  if (!/\r?\n/.test(input[input.length - 1])) {
    inputRemain = lines.pop() || '';
  }

  for (const line of lines) { // eslint-disable-line
    await waitFn(() => isWorkersReady(workers)); // eslint-disable-line
    switcher(line, workers)
      .forEach(worker => worker.input(`${line}\n`));
  }
  process.stdin.resume();
});

const finish = () => {
  console.log('\nending session\n');
  process.stdin.close();

  // close connection
  Object
    .values(workers)
    .forEach(worker => worker.close());
};

process.stdin.on('end', async () => {
  await waitFn(() => isWorkersReady(workers));
  finish();
  console.log('end');
});
process.stdin.on('SIGINT', finish);
process.stdin.on('SIGTERM', finish);
process.on('SIGINT', finish);
process.on('SIGTERM', finish);
