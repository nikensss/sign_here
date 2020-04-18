class AppState {
  constructor() {
    this._files = [];
    this._isSelectedFiles = false;
    this._signature = '';
    this._isSelectedSignature = false;
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

  canSign() {
    return this._isSelectedFiles && this._isSelectedSignature;
  }
}

module.exports = AppState;
