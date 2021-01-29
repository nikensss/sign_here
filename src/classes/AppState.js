const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const chalk = require('chalk');
const Message = require('./Message');
const UserData = require('./UserData');
const Notary = require('./Notary');

class AppState {
  constructor() {
    this._files = [];
    this._isSelectedFiles = false;
    this._signature = '';
    this._isSelectedSignature = false;
    this._successSigns = 0;
    this._failedSigns = 0;
    this._targetText = '';
    this._win = null;
    this._userData = new UserData();
  }

  set win(win) {
    this._win = win;
  }

  get successSigns() {
    return this._successSigns;
  }

  addSuccess() {
    this._successSigns += 1;
  }

  get failedSigns() {
    return this._failedSigns;
  }

  addFail() {
    this._failedSigns += 1;
  }

  get isSelectedFiles() {
    return this._isSelectedFiles;
  }

  set isSelectedFiles(value) {
    this._isSelectedFiles = value;
  }

  get files() {
    return [...this._files];
  }

  set files(files) {
    if (files.length === 0) {
      this._isSelectedFiles = false;
      throw new Error('No files received');
    }
    if (files.some((f) => f === '')) {
      this._isSelectedFiles = false;
      throw new Error('Some files are invalid');
    }
    this._isSelectedFiles = true;
    this._files = [...files];
    this._successSigns = 0;
    this._failedSigns = 0;
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

  get signature() {
    return this._signature;
  }

  set signature(signature) {
    if (signature === '') {
      throw new Error('Invalid signature');
    }
    this._isSelectedSignature = true;
    this._signature = signature;
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
    this._userData.set('signature', result.filePaths[0]);
    event.reply(Message.COLLECTED_SIGNATURE, this.signature);
    if (this.canSign()) event.reply(Message.CAN_SIGN);
  }

  get targetText() {
    return this._targetText;
  }

  set targetText(targetText) {
    if (typeof targetText === 'undefined' || targetText === '') {
      throw new Error(`[AppState] Invalid target text: ${targetText}`);
    }

    this._targetText = targetText;
  }

  canSign() {
    return this._isSelectedFiles && this._isSelectedSignature;
  }

  async signAll(event, files, targetText) {
    //remove those files that were discarded in the frontend
    this.files = this.files.filter((f) => files.includes(path.basename(f)));

    this.targetText = targetText;
    this._userData.set('targetText', this.targetText);
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
    if (fs.existsSync(this._userData.get('signature'))) {
      this.signature = this._userData.get('signature');
      event.reply(Message.COLLECTED_SIGNATURE, this.signature);
    }

    if (typeof this._userData.get('targetText') !== 'undefined') {
      this.targetText = this._userData.get('targetText');
      event.reply(Message.COLLECTED_TARGET_TEXT, this.targetText);
    }
  }
}

module.exports = AppState;
