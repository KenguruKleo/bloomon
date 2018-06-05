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

module.exports = {
  waitFn,
};
