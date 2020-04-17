const path = require('path');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const Notary = require('./classes/Notary');
const Messages = require('./classes/Messages');
const AppState = require('./classes/AppState');

const appState = new AppState();

ipcMain.on('get-messages', (event) => (event.returnValue = Messages));

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  ipcMain.on(Messages.SELECT_FILES, async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    console.log('files selected', result.filePaths);
    if (result.filePaths.length === 0) {
      return;
    }
    appState.selectedFiles = result.filePaths;
    event.reply(
      Messages.COLLECTED_PDFS,
      appState.selectedFiles.map((f) => path.basename(f))
    );
    if (appState.canSign()) {
      event.reply(Messages.CAN_SIGN);
    }
  });

  ipcMain.on(Messages.SELECT_SIGNATURE, async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      title: 'The title',
      properties: ['openFile'],
      filters: [
        { name: 'PNG', extensions: ['png'] },
        { name: 'JPG', extensions: ['jpg'] },
        { name: 'Images', extensions: ['jpg', 'png'] }
      ]
    });
    if (result.filePaths.length === 0 || result.filePaths[0].length === 0) {
      return;
    }
    console.log('signature selected', result.filePaths);
    appState.selectedSignature = result.filePaths[0];
    event.reply(Messages.COLLECTED_SIGNATURE, appState.selectedSignature);
    if (appState.canSign()) {
      event.reply(Messages.CAN_SIGN);
    }
  });

  ipcMain.on(Messages.SIGN_ALL, async (event, files) => {
    //remove those files that were discarded in the frontend
    appState.selectedFiles = appState.selectedFiles.filter((sf) =>
      files.includes(path.basename(sf))
    );
    console.log('signing files', appState.selectedFiles);
    const notary = new Notary();
    appState.selectedFiles.forEach(async (f) => {
      try {
        console.log(`[index.js] asking Notary to sign ${f}`);
        await notary
          .sign(f, appState.selectedSignature)
          .then(() => event.reply(Messages.FILE_SIGNED, path.basename(f)));
        console.log(`[index.js] Notary should be finished signing ${f}`);
        event.reply(Messages.CAN_SIGN);
      } catch (ex) {
        console.error(ex);
      }
    });
  });

  // and load the index.html of the app.
  win.loadFile('./html/index.html');

  // Open the DevTools.
  win.webContents.openDevTools();
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
