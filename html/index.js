$(document).ready(() => {
  $('#pdf').click(() => {
    console.log('requesting pdfs directory');
    window.postMessage({
      type: 'select-dir',
    });
  });

  $('#signature').click(() => {
    console.log('requesting signature image');
    window.postMessage({
      type: 'select-signature',
    });
  });

  window.showCollectedPdfs = function (files) {
    console.log('adding ', files);
    files.forEach((f) => {
      const fileDiv = $('<div/>', {
        class: 'alert alert-info',
        id: f,
        text: f,
      });
      $('#files-list').append(fileDiv);
    });
  };

  window.showCollectedSignature = function (signature) {
    const signatureImage = $('<img/>', {
      class: 'w-100',
      src: signature,
    });
    $('signature-view').append(signatureImage);
  };
});
