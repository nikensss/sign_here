const { ipcRenderer, webFrame } = require('electron');

process.once('loaded', () => {
  ipcRenderer.on('collected-pdfs', (event, pdfs) => {
    console.log('[preload] message received: collected-pdfs', pdfs);
    webFrame.executeJavaScript(
      'window.showCollectedPdfs([' + pdfs.map((f) => '"' + f + '"') + ']);'
    );
  });

  ipcRenderer.on('collected-signature', (event, signature) => {
    console.log('[preload] message received: collected-signature', signature);
    webFrame.executeJavaScript(
      'window.showCollectedSignature("' +
        signature.replace(/\\/g, '\\\\') +
        '");'
    );
  });

  ipcRenderer.on('can-sign', (event) => {
    console.log('[preload] can sign!');
    webFrame.executeJavaScript('window.enableSignAll();');
  });

  ipcRenderer.on('file-signed', (event, file) => {
    console.log('[preload] received file signed ', file);
    webFrame.executeJavaScript('window.fileSigned("' + file + '");');
  });

  window.addEventListener('message', (evt) => {
    console.log('[preload] received message', evt);
    if (evt.data.type === 'select-files') {
      ipcRenderer.send('select-files');
    } else if (evt.data.type === 'select-signature') {
      ipcRenderer.send('select-signature');
    } else if (evt.data.type === 'sign-all') {
      ipcRenderer.send('sign-all', evt.data.files);
    }
  });
});
