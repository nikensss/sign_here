/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const chalk = require('chalk');

/**
 * User preferences persistence.
 */
class UserData {
  constructor() {
    this.fileName = 'config.json';
    this.filePath = path.join(app.getPath('userData'), this.fileName);
    console.log(chalk.magenta('[UserData] file path'), this.filePath);
    this.data = this.load();
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      this.initializeConfigFile();
    }
    return JSON.parse(fs.readFileSync(this.filePath));
  }

  initializeConfigFile() {
    const fd = fs.openSync(this.filePath, 'w');
    fs.writeFileSync(fd, '{}');
    fs.closeSync(fd);
  }

  save() {
    console.log(chalk.magenta('[UserData] saving settings'));
    fs.writeFileSync(this.filePath, JSON.stringify(this.data));
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    console.log(chalk.magenta(`[UserData] setting '${key}' to '${value}'`));
    this.save();
  }
}

module.exports = UserData;
