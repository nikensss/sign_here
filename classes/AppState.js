class AppState {
  constructor() {
    this._selectedFiles = [];
    this._isSelectedFiles = false;
    this._selectedSignature = '';
    this._isSelectedSignature = false;
  }

  get isSelectedFiles() {
    return this._isSelectedFiles;
  }

  set isSelectedFiles(value) {
    this._isSelectedFiles = value;
  }

  get selectedFiles() {
    return [...this._selectedFiles];
  }

  set selectedFiles(files) {
    if (files.length === 0) {
      this._isSelectedFiles = false;
      throw new Error('No files received');
    }
    if (files.some((f) => f === '')) {
      this._isSelectedFiles = false;
      throw new Error('Some files are invalid');
    }
    this._isSelectedFiles = true;
    this._selectedFiles = [...files];
  }

  get selectedSignature() {
    return this._selectedSignature;
  }

  set selectedSignature(signature) {
    if (signature === '') {
      throw new Error('Invalid signature');
    }
    this._isSelectedSignature = true;
    this._selectedSignature = signature;
  }

  canSign() {
    return this._isSelectedFiles && this._isSelectedSignature;
  }
}

module.exports = AppState;
