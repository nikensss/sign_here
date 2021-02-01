const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const chalk = require('chalk');
const Message = require('./Message');
const UserData = require('./UserData');
const Notary = require('./Notary');

class AppState {
  #win;
  #files;
  #userData;
  #successSigns;
  #failedSigns;

  constructor() {
    this.#files = [];
    this.#successSigns = 0;
    this.#failedSigns = 0;
    this.#win = null;
    this.#userData = new UserData();
  }

  /**
   * Main window.
   *
   * @param {Electron.BrowserWindow} win
   */
  set win(win) {
    this.#win = win;
    this.#win.loadFile(path.join(__dirname, '..', 'html', 'index.html'));
  }

  resetCount() {
    this.#successSigns = 0;
    this.#failedSigns = 0;
  }

  get successSigns() {
    return this.#successSigns;
  }

  addSuccess() {
    this.#successSigns += 1;
  }

  get failedSigns() {
    return this.#failedSigns;
  }

  addFail() {
    this.#failedSigns += 1;
  }

  get files() {
    return [...this.#files];
  }

  set files(files) {
    if (files.length === 0) {
      this.#files = [];
      throw new Error('No files received');
    }

    if (files.some((f) => f === '')) {
      this.#files = [];
      throw new Error('Some files are invalid');
    }

    this.#files = [...files];
    this.resetCount();
  }

  get isSelectedFiles() {
    return this.#files.length > 0;
  }

  get signature() {
    return this.#userData.get('signature');
  }

  set signature(signature) {
    if (signature === '') {
      throw new Error('Invalid signature');
    }
    this.#userData.set('signature', signature);
  }

  get isSelectedSignature() {
    return this.signature;
  }

  async selectFiles(event, arg) {
    const result = await dialog.showOpenDialog(this._win, {
      title: "Selecciona los PDF's",
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    console.log(chalk.blue('[AppState] files selected'), result.filePaths);

    if (result.filePaths.length === 0) return;

    this.files = result.filePaths;
    event.reply(
      Message.COLLECTED_PDFS,
      this.files.map((f) => path.basename(f))
    );

    if (this.canSign()) event.reply(Message.CAN_SIGN);
  }

  async selectSignature(event) {
    const result = await dialog.showOpenDialog(this._win, {
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

    console.log(chalk.blue('[AppState] signature selected'), result.filePaths);

    this.signature = result.filePaths[0];
    event.reply(Message.COLLECTED_SIGNATURE, this.signature);
    if (this.canSign()) event.reply(Message.CAN_SIGN);
  }

  get targetText() {
    return this.#userData.get('targetText');
  }

  set targetText(targetText) {
    if (typeof targetText === 'undefined' || targetText === '') {
      throw new Error(`[AppState] Invalid target text: ${targetText}`);
    }
    this.#userData.set('targetText', targetText);
  }

  canSign() {
    return this.isSelectedFiles && this.isSelectedSignature;
  }

  async signAll(event, files, targetText) {
    //remove those files that were discarded in the frontend
    this.files = this.files.filter((f) => files.includes(path.basename(f)));

    this.targetText = targetText;
    console.log(chalk.blue('[AppState] target text:'), this.targetText);
    console.log(chalk.blue('[AppState] signing files'), this.files);

    const worker = Notary.signAll(this);

    worker.on('message', (m) => {
      console.log(`message from worker:`, m);
      if (m.ok) {
        event.reply(Message.FILE_SIGNED, path.basename(m.originalFile));
        this.addSuccess();
      } else {
        console.log(
          chalk.red(
            `[AppState] couldn't sign ${m.originalFile}; reason: ${m.error}`
          )
        );
        event.reply(
          Message.FILE_NOT_SIGNED,
          path.basename(m.originalFile),
          m.error
        );
        this.addFail();
      }
    });

    worker.on('exit', async (exitCode) => {
      await dialog.showMessageBox({
        type: 'info',
        button: ['Ok'],
        defaultId: 0,
        title: 'Don Notario',
        message: 'Time for a break!',
        detail: `Correctly signed: ${this.successSigns}\nNot signed: ${this.failedSigns}`
      });
    });

    worker.on('error', (err) => {
      console.log(`error from worker:`, err);
    });
  }

  loadUserData(event) {
    console.log(chalk.blue('[AppState] loading user data'));
    if (fs.existsSync(this.signature)) {
      event.reply(Message.COLLECTED_SIGNATURE, this.signature);
    }

    if (typeof this.targetText !== 'undefined') {
      event.reply(Message.COLLECTED_TARGET_TEXT, this.targetText);
    }
  }
}

module.exports = AppState;
