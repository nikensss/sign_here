const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const chalk = require('chalk');

const Notary = require('./classes/Notary');
const Message = require('./classes/Message');
const AppState = require('./classes/AppState');
const UserData = require('./classes/UserData');

const appState = new AppState();
const userData = new UserData();
const getPlatformSpecificIcon = () => {
  if (process.platform === 'win32') return 'icon.ico';
  if (process.platform === 'darwin') return 'icon.icns';
  return 'icon.png';
};

ipcMain.on('get-messages', (event) => (event.returnValue = Message));

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'icon', getPlatformSpecificIcon()),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  ipcMain.on(Message.SELECT_FILES, async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      title: "Selecciona los PDF's",
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    console.log(chalk.blue('[main.js] files selected'), result.filePaths);

    if (result.filePaths.length === 0) return;

    appState.files = result.filePaths;
    event.reply(
      Message.COLLECTED_PDFS,
      appState.files.map((f) => path.basename(f))
    );

    if (appState.canSign()) event.reply(Message.CAN_SIGN);
  });

  ipcMain.on(Message.SELECT_SIGNATURE, async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Selecciona la imagen de la firma',
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

    console.log(chalk.blue('[main.js] signature selected'), result.filePaths);

    appState.signature = result.filePaths[0];
    userData.set('signature', result.filePaths[0]);
    event.reply(Message.COLLECTED_SIGNATURE, appState.signature);
    if (appState.canSign()) event.reply(Message.CAN_SIGN);
  });

  ipcMain.on(Message.SIGN_ALL, async (event, files) => {
    //remove those files that were discarded in the frontend
    appState.files = appState.files.filter((sf) => files.includes(path.basename(sf)));
    console.log(chalk.blue('[main.js] signing files'), appState.files);
    const notary = new Notary();

    for (let file of appState.files) {
      try {
        let result = await notary.sign(file, appState.signature);
        if (result.ok) {
          event.reply(Message.FILE_SIGNED, path.basename(result.originalFile));
          appState.addSuccess();
        } else {
          console.log(chalk.red(`[main.js] couldn't sign ${result.originalFile}; reason: ${result.error}`));
          event.reply(Message.FILE_NOT_SIGNED, path.basename(result.originalFile), result.error);
          appState.addFail();
        }
      } catch (ex) {
        console.error(ex);
      }
    }
    await dialog.showMessageBox({
      type: 'info',
      button: ['Ok'],
      defaultId: 0,
      title: 'Don Notario',
      message: '¡Me voy a desayunar!',
      detail: `Firmados correctamente: ${appState.successSigns}\nNo firmados: ${appState.failedSigns}`
    });
  });

  ipcMain.on(Message.LOAD_USER_DATA, (event) => {
    console.log(chalk.blue('[main.js] loading user signature'));
    if (fs.existsSync(userData.get('signature'))) {
      appState.signature = userData.get('signature');
      event.reply(Message.COLLECTED_SIGNATURE, appState.signature);
    }
  });

  // and load the index.html of the app.
  win.loadFile('./html/index.html');

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
