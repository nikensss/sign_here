/* eslint-disable no-console */
const { ipcRenderer, contextBridge } = require('electron');

const Message = ipcRenderer.sendSync('get-messages');

contextBridge.exposeInMainWorld('Message', Message);

process.once('loaded', () => {
  ipcRenderer.on(Message.COLLECTED_PDFS, (event, pdfs) => {
    console.log(
      '[preload - ipcRenderer] message received: collected-pdfs',
      pdfs
    );
    window.postMessage({
      type: Message.COLLECTED_PDFS,
      pdfs
    });
  });

  ipcRenderer.on(Message.COLLECTED_SIGNATURE, (event, signature) => {
    console.log(
      '[preload - ipcRenderer] message received: collected-signature',
      signature
    );
    window.postMessage({
      type: Message.COLLECTED_SIGNATURE,
      signature
    });
  });

  ipcRenderer.on(Message.COLLECTED_TARGET_TEXT, (event, targetText) => {
    console.log(
      '[preload - ipcRenderer] message received: collected-target-text',
      targetText
    );
    window.postMessage({
      type: Message.COLLECTED_TARGET_TEXT,
      targetText
    });
  });

  ipcRenderer.on(Message.CAN_SIGN, () => {
    console.log('[preload - ipcRenderer] can sign!');
    window.postMessage({
      type: Message.CAN_SIGN
    });
  });

  ipcRenderer.on(Message.FILE_SIGNED, (event, file) => {
    console.log('[preload - ipcRenderer] received file signed ', file);
    window.postMessage({
      type: Message.FILE_SIGNED,
      file
    });
  });

  ipcRenderer.on(Message.FILE_NOT_SIGNED, (event, file, reason) => {
    console.log(
      '[preload - ipcRenderer] received file NOT signed and reason',
      file,
      reason
    );
    window.postMessage({
      type: Message.FILE_NOT_SIGNED,
      file,
      reason
    });
  });

  window.addEventListener('message', (event) => {
    if (!(event.origin === 'file://' && event.source === window)) {
      console.log('[preload] ignoring message of type', event.data.type);
    }
    console.log('[preload] event', event);
    console.log('[preload] received message of type', event.data.type);
    switch (event.data.type) {
      case Message.SELECT_FILES:
        ipcRenderer.send(Message.SELECT_FILES);
        break;
      case Message.SELECT_SIGNATURE:
        ipcRenderer.send(Message.SELECT_SIGNATURE);
        break;
      case Message.SIGN_ALL:
        ipcRenderer.send(
          Message.SIGN_ALL,
          event.data.files,
          event.data.targetText
        );
        break;
      case Message.LOAD_USER_DATA:
        ipcRenderer.send(Message.LOAD_USER_DATA);
        break;
      default:
        console.log('[preload] unknown type: ', event.data.type);
    }
  });

  window.logSomething = () => console.log('Something');
});
