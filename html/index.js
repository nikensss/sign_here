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
      const fileRow = $('<div/>', {
        class: 'row file',
        id: f
      });
      const fileCol = $('<div/>', {
        class: 'col-9 px-2 alert alert-info',
        text: f
      });
      const deleteButtonCol = $('<div/>', {
        class: 'col-3 px-2'
      });
      const deleteButton = $('<button/>', {
        class: 'alert alert-danger',
        html: '&times;'
      });
      deleteButtonCol.append(deleteButton);
      fileRow.append(fileCol).append(deleteButtonCol);
      $('#files-list').append(fileRow);
      deleteButton.click(function () {
        $(this)
          .closest('.row.file')
          .addClass('disappear')
          .on('transitionend', function (event) {
            $(this).remove();
          });
      });
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
