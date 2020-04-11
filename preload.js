const { ipcRenderer } = require('electron');

process.once('loaded', () => {
  window.addEventListener('message', (evt) => {
    console.log('received message', evt);
    if (evt.data.type === 'select-dir') {
      ipcRenderer.send('select-dir');
    }
  });

  ipcRenderer.on('files', (event, arg) => {
    console.log('message received', arg);
  });
});
