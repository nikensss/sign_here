const fs = require('fs').promises;
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1600,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  ipcMain.on('select-dir', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
    console.log('directories selected', result.filePaths);
    const files = await fs
      .readdir(result.filePaths[0])
      .catch((e) => console.error(e));
    console.log('available files: ', files);
    event.sender.send('files', files);
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
