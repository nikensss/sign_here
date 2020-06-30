const Notary = require('./Notary');
const { workerData, parentPort, isMainThread } = require('worker_threads');

if (isMainThread) {
  throw new Error('[SignService] Called from main thread; stopping!');
}

const { files, signature, targetText } = workerData;

const notary = new Notary();

(async function () {
  for (const file of files) {
    await notary
      .sign(file, signature, targetText)
      .then(r => parentPort.postMessage(r));
  }
})();
