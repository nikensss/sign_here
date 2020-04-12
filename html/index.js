$(document).ready(() => {
  $('#pdf').click(() => {
    console.log('requesting pdfs files');
    window.postMessage({
      type: 'select-files'
    });
  });

  $('#signature').click(() => {
    console.log('requesting signature image');
    window.postMessage({
      type: 'select-signature'
    });
  });

  $('#sign-all').click(() => {
    console.log('requesting signature stamping');
    window.postMessage({
      type: 'sign-all'
    });
    $('#sign-all').attr('disabled', true);
  });

  window.showCollectedPdfs = function (files) {
    $('#files-list').empty();
    console.log('showing collected files ', files);
    files.forEach((f) => {
      // const fileRow = $('<div/>', {
      //   class: 'row m-0 px-5'
      // });
      const fileCol = $('<div/>', {
        class: 'mx-auto w-50 alert alert-info',
        id: f,
        text: f
      });
      $('#files-list').append(fileCol);
    });
  };

  window.showCollectedSignature = function (signature) {
    console.log('showing collected signature', signature);
    const signatureImage = $('<img/>', {
      class: 'w-100',
      src: signature
    });
    $('#signature-view').empty().append(signatureImage);
  };

  window.enableSignAll = function () {
    $('#sign-all').attr('disabled', false);
  };

  window.fileSigned = function (file) {
    console.log('file signed ', file);
    this.document.getElementById(file).classList.remove('alert-info');
    this.document.getElementById(file).classList.add('alert-success');
  };
});
