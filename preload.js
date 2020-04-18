const { ipcRenderer, webFrame, contextBridge } = require('electron');

const Messages = ipcRenderer.sendSync('get-messages');

contextBridge.exposeInMainWorld('Messages', Messages);

process.once('loaded', () => {
  ipcRenderer.on(Messages.COLLECTED_PDFS, (event, pdfs) => {
    console.log('[preload - ipcRenderer] message received: collected-pdfs', pdfs);
    window.postMessage({
      type: Messages.COLLECTED_PDFS,
      pdfs: pdfs
    });
  });

  ipcRenderer.on(Messages.COLLECTED_SIGNATURE, (event, signature) => {
    console.log('[preload - ipcRenderer] message received: collected-signature', signature);
    window.postMessage({
      type: Messages.COLLECTED_SIGNATURE,
      signature: signature
    });
  });

  ipcRenderer.on(Messages.CAN_SIGN, (event) => {
    console.log('[preload - ipcRenderer] can sign!');
    window.postMessage({
      type: Messages.CAN_SIGN
    });
  });

  ipcRenderer.on(Messages.FILE_SIGNED, (event, file) => {
    console.log('[preload - ipcRenderer] received file signed ', file);
    window.postMessage({
      type: Messages.FILE_SIGNED,
      file: file
    });
  });

  ipcRenderer.on(Messages.EVERYTHING_SIGNED, (event, file) => {
    console.log('[preload - ipcRenderer] received message "everything signed"');
    window.postMessage({
      type: Messages.EVERYTHING_SIGNED
    });
  });

  window.addEventListener('message', (event) => {
    if (!(event.origin === 'file://' && event.source === window)) {
      console.log('[preload] ignoring message of type', event.data.type);
    }
    console.log('[preload] event', event);
    console.log('[preload] received message of type', event.data.type);
    switch (event.data.type) {
      case Messages.SELECT_FILES:
        ipcRenderer.send(Messages.SELECT_FILES);
        break;
      case Messages.SELECT_SIGNATURE:
        ipcRenderer.send(Messages.SELECT_SIGNATURE);
        break;
      case Messages.SIGN_ALL:
        ipcRenderer.send(Messages.SIGN_ALL, event.data.files);
        break;
      case Messages.LOAD_USER_DATA:
        ipcRenderer.send(Messages.LOAD_USER_DATA);
        break;
      default:
        console.log('[preload] unknown type: ', event.data.type);
    }
  });

  window.logSomething = () => console.log('Something');
});
