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
      'window.showCollectedSignature("' + signature + '");'
    );
  });

  window.addEventListener('message', (evt) => {
    console.log('received message', evt);
    if (evt.data.type === 'select-dir') {
      ipcRenderer.send('select-dir');
    } else if (evt.data.type === 'select-signature') {
      ipcRenderer.send('select-signature');
    }
  });
});
