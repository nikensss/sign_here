const { workerData, parentPort, isMainThread } = require('worker_threads');
const Notary = require('./Notary');

if (isMainThread) {
  throw new Error('[SignService] Called from main thread; stopping!');
}

const { files, signature, targetText } = workerData;

const notary = new Notary();

(async function sign() {
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    // we want to await in this loop to properly fill the progress bar in the frontend
    // eslint-disable-next-line no-await-in-loop
    await notary
      .sign(file, signature, targetText)
      .then((r) => parentPort.postMessage(r));
  }
})();
