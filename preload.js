const { ipcRenderer, webFrame } = require('electron');

process.once('loaded', () => {
  ipcRenderer.on('collected-pdfs', (event, pdfs) => {
    console.log('message received: collected-pdfs', pdfs);
    webFrame.executeJavaScript(
      'window.showCollectedPdfs([' + pdfs.map((f) => '"' + f + '"') + ']);'
    );
  });

  ipcRenderer.on('collected-signature', (event, signature) => {
    console.log('message received: collected-signature', signature);
    webFrame.executeJavaScript(
      'window.showCollectedSignature("' +
        signature.replace(/\\/g, '\\\\') +
        '");'
    );
  });

  ipcRenderer.on('can-sign', (event) => {
    console.log('can sign!');
    webFrame.executeJavaScript('window.enableSignAll();');
  });

  ipcRenderer.on('file-signed', (event, file) => {
    console.log('received file signed ', file);
    webFrame.executeJavaScript('window.fileSigned("' + file + '");');
  });

  window.addEventListener('message', (evt) => {
    console.log('received message', evt);
    if (evt.data.type === 'select-dir') {
      ipcRenderer.send('select-dir');
    } else if (evt.data.type === 'select-signature') {
      ipcRenderer.send('select-signature');
    } else if (evt.data.type === 'sign-all') {
      ipcRenderer.send('sign-all');
    }
  });
});
