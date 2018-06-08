const { isWorkersReady } = require('../worker');
const { waitFn } = require('../utils/waitings');

const processingStream = (stream, workers, switcher) => (
  new Promise(done => {
    stream.resume();
    let busy = false;

    let inputRemain = '';
    stream.on('data', async rawInput => {
      const input = rawInput.toString();
      stream.pause();
      busy = true;

      const lines = (inputRemain + input).split(/\r?\n/);

      if (!/\r?\n/.test(input[input.length - 1])) {
        inputRemain = lines.pop() || '';
      }

      for (const line of lines) { // eslint-disable-line
        await waitFn(() => isWorkersReady(workers)); // eslint-disable-line
        switcher(line, workers)
          .forEach(worker => worker.input(`${line}\n`));
      }
      stream.resume();
      busy = false;
    });

    const finish = async () => {
      stream.close();

      await waitFn(() => isWorkersReady(workers));
      await waitFn(() => !busy);
      // close connection
      Object
        .values(workers)
        .forEach(worker => worker.close());

      done();
    };

    stream.on('end', finish);
    stream.on('SIGINT', finish);
    stream.on('SIGTERM', finish);
  })
);

module.exports = processingStream;
