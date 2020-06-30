const pdf = require('pdf-parse'); //check documents https://mozilla.github.io/pdf.js/

/**
 * The Holmes class has the capabilities of looking
 * for a specific string of text in a PDF document.
 * It wraps the pdf-parse node package.
 */
class Holmes {
  constructor() {}

  /**
   * Returns the {x,y} position and the width of the target text.
   *
   * @param {String} text The text to find
   * @param {DataBuffer} dataBuffer The data buffer that represents the target file (use `fs.read()`)
   */
  async find(text, dataBuffer) {
    const result = {
      found: false,
      x: null,
      y: null,
      width: null,
      page: null //0-based index
    };
    let pageCount = -1;

    await pdf(dataBuffer, {
      pagerender: async function (pageData) {
        let render_options = {
          normalizeWhitespace: false,
          disableCombineTextItems: false
        };

        await pageData.getTextContent(render_options).then(function (textContent) {
          pageCount += 1;
          for (let item of textContent.items) {
            if (item.str.includes(text)) {
              result.found = true;
              result.x = item.transform[4];
              result.y = item.transform[5];
              result.width = item.width;
              result.page = pageCount;
            }
          }
        });
      }
    });

    return result;
  }
}

module.exports = Holmes;
