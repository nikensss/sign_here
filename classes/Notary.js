const fs = require('fs').promises;
const PDFDocument = require('pdf-lib').PDFDocument;

class Notary {
  constructor() {}

  async sign(file, signature) {
    console.log('[Notary] signing ', file);
    console.log('[Notary] signing with ', signature);
    try {
      const pngImageBytes = await fs.readFile(signature);

      const pdfBytes = await fs.readFile(file);
      const pdf = await PDFDocument.load(pdfBytes);

      const pngImage = await pdf.embedPng(pngImageBytes);

      const pngDims = pngImage.scale(0.06);

      const pages = pdf.getPages();
      if (pages.length < 2) {
        console.log(`No second page at ${file}; skipping...`);
        return {
          status: 'error',
          ok: false,
          error: "file doesn't have a second page",
          originalFile: file,
          outputFile: ''
        };
      }

      const page = pages[1];

      page.drawImage(pngImage, {
        x: (3 * page.getWidth()) / 7,
        y: (5.21 * page.getHeight()) / 14,
        width: pngDims.width,
        height: pngDims.height
      });

      const pdfBytesSaved = await pdf.save();
      await fs.writeFile(file.replace('.pdf', '_firmat.pdf'), pdfBytesSaved);
      console.log('[Notary] done signing ', file);

      return {
        status: 'ok',
        ok: true,
        error: '',
        originalFile: file,
        outputFile: file.replace('.pdf', '_firmat.pdf')
      };
    } catch (ex) {
      console.error('Exception recorded', ex);
    }
  }
}

module.exports = Notary;
