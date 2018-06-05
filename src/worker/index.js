const worker = require('./worker');
const Conveyor = require('./conveyor');
const WorkerClient = require('./worker-client');
const constants = require('./constants');

const isWorkersReady = workers => (
  Object
    .values(workers)
    .every(wrk => wrk.ready)
);

const getWorkersReadyDescription = workers => (
  Object
    .keys(workers)
    .map(key => `W:${key}: ${workers[key].ready}`)
    .join(', ')
);

module.exports = {
  worker,
  Conveyor,
  WorkerClient,
  isWorkersReady,
  getWorkersReadyDescription,
  constants,
};

if (!module.parent) {
  worker(
    {
      host: process.argv[2],
      port: process.argv[3],
    },
    Conveyor,
  );
}
