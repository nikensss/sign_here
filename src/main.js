const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const Message = require('./classes/Message');
const AppState = require('./classes/AppState');

const appState = new AppState();

ipcMain.on('get-messages', (event) => (event.returnValue = Message));

function createWindow() {
  // Create the browser window.
  appState.win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '..', 'icon', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  ipcMain.on(Message.SELECT_FILES, (event) => appState.selectFiles(event));

  ipcMain.on(Message.SELECT_SIGNATURE, (event) =>
    appState.selectSignature(event)
  );

  ipcMain.on(Message.SIGN_ALL, (event, files, targetText) =>
    appState.signAll(event, files, targetText)
  );

  ipcMain.on(Message.LOAD_USER_DATA, (event) => appState.loadUserData(event));

  appState.show(path.join(__dirname, 'html', 'index.html'));

  appState.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
