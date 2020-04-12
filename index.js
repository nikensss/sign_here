const fs = require('fs').promises;
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const Notary = require('./classes/Notary');
const Messages = require('./classes/Messages');
const appState = {
  isDirSelected: false,
  isSignatureSelected: false,
  selectedDir: '',
  selectedSignature: '',
};

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  ipcMain.on(Messages.SELECT_DIR, async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
    console.log('directories selected', result.filePaths);
    if (result.filePaths.length === 0 || result.filePaths[0].length === 0) {
      return;
    }
    const files = await fs.readdir(result.filePaths[0]).catch((e) => console.error(e));
    console.log('available files: ', files);
    if (files.length === 0) {
      return;
    }
    appState.isDirSelected = true;
    appState.selectedDir = result.filePaths[0];
    event.sender.send(Messages.COLLECTED_PDFS, files);
    if (appState.isDirSelected && appState.isSignatureSelected) {
      event.sender.send(Messages.CAN_SIGN);
    }
  });

  ipcMain.on(Messages.SELECT_SIGNATURE, async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      title: 'The title',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
    });
    if (result.filePaths.length === 0 || result.filePaths[0].length === 0) {
      return;
    }
    console.log('signature selected', result.filePaths);
    appState.isSignatureSelected = true;
    appState.selectedSignature = result.filePaths[0];
    event.sender.send(Messages.COLLECTED_SIGNATURE, appState.selectedSignature);
    if (appState.isDirSelected && appState.isSignatureSelected) {
      event.sender.send(Messages.CAN_SIGN);
    }
  });

  ipcMain.on(Messages.SIGN_ALL, (event, arg) => {
    console.log('signing everything');
    const notary = new Notary();
    fs.readdir(appState.selectedDir)
      .then((files) =>
        files.forEach(async (f) => {
          console.log('signing: ', f);
          await notary.sign(path.join(appState.selectedDir, f), appState.selectedSignature);
          event.sender.send(Messages.FILE_SIGNED, f);
        })
      )
      .then(() => {
        console.log('everything signed');
        event.sender.send(Messages.CAN_SIGN);
      })
      .catch((e) => console.error(e));
  });

  // and load the index.html of the app.
  win.loadFile('./html/index.html');

  // Open the DevTools.
  // win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
