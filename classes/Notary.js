const fs = require('fs').promises;
const PDFDocument = require('pdf-lib').PDFDocument;
const Holmes = require('./Holmes');
const chalk = require('chalk');

class Notary {
  constructor() {
    this.holmes = new Holmes();
  }

  async sign(file, signature, targetText) {
    console.log(chalk.green('[Notary] signing '), file);
    console.log(chalk.green('[Notary] signing with '), signature);
    try {
      const pngImageBytes = await fs.readFile(signature);

      const pdfBytes = await fs.readFile(file);
      const pdf = await PDFDocument.load(pdfBytes);
      const signatureLocation = await this.holmes.find(targetText, pdfBytes);

      if (!signatureLocation.found) {
        return {
          status: 'error',
          ok: false,
          error: 'target text could not be found',
          originalFile: file,
          outputFile: ''
        };
      }

      console.log(
        chalk.green('[Notary] signature location found at'),
        signatureLocation
      );
      const pngImage = await pdf.embedPng(pngImageBytes);

      const pngDims = pngImage.scale(0.06);

      const pages = pdf.getPages();
      const page = pages[signatureLocation.page];

      page.drawImage(pngImage, {
        x: signatureLocation.x + signatureLocation.width,
        y: signatureLocation.y - pngDims.height / 2,
        width: pngDims.width,
        height: pngDims.height
      });

      const pdfBytesSaved = await pdf.save();
      await fs.writeFile(file.replace('.pdf', '_firmat.pdf'), pdfBytesSaved);
      console.log(chalk.green('[Notary] done signing '), file);

      return {
        status: 'ok',
        ok: true,
        error: '',
        originalFile: file,
        outputFile: file.replace('.pdf', '_firmat.pdf')
      };
    } catch (ex) {
      console.error('Exception recorded', ex);
      return {
        status: 'error',
        ok: false,
        error: ex,
        originalFile: file,
        outputFile: ''
      };
    }
  }
}

module.exports = Notary;
