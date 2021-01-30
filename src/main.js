const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const Message = require('./classes/Message');
const AppState = require('./classes/AppState');

const appState = new AppState();

const getPlatformSpecificIcon = () => {
  // if (process.platform === 'win32') return 'icon.ico';
  // if (process.platform === 'darwin') return 'icon.icns';
  return 'icon.png';
};

ipcMain.on('get-messages', (event) => (event.returnValue = Message));

function createWindow() {
  // Create the browser window.
  appState.win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.resolve('icon', getPlatformSpecificIcon()),
    webPreferences: {
      preload: path.resolve('src', 'preload.js'),
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

  // Open the DevTools.
  //win.webContents.openDevTools();
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
