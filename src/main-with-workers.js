const { fork } = require('child_process');
const main = require('./main');

const forkWorker = params => (
  new Promise(done => {
    const worker = fork('./src/worker', params, { silent: true });
    worker.stdout.on('data', data => {
      if (/Listen connection on host:.*/.test(data)) {
        setTimeout(() => done(worker), 0);
      }
    });
  })
);

const run = async () => {
  const workers = await Promise.all([
    forkWorker(['0.0.0.0', '8001']),
    forkWorker(['0.0.0.0', '8002']),
  ]);

  await main();
  workers.forEach(worker => worker.kill());
};

run();
