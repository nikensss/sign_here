$(document).ready(() => {
  $('#pdf').click(() => {
    console.log('[window] requesting pdfs files');
    window.postMessage({
      type: 'select-files'
    });
  });

  $('#signature').click(() => {
    console.log('[window] requesting signature image');
    window.postMessage({
      type: 'select-signature'
    });
  });

  $('#sign-all').click(() => {
    console.log('[window] requesting signature stamping');
    const files = $('.file.show')
      .map((i, e) => $(e).attr('data-basename'))
      .get();
    window.postMessage({
      type: 'sign-all',
      files: files
    });
    $('#sign-all').attr('disabled', true);
  });

  window.showCollectedPdfs = function (files) {
    $('#files-list').empty();
    console.log('[window] showing collected files ', files);

    files.forEach((f, i) => {
      const collapsibleRow = $('<div/>', {
        class: 'collapse show file',
        id: 'file-' + i,
        'data-basename': f
      });
      const fileRow = $('<div/>', {
        class: 'row p-3 justify-content-around align-items-center'
      });
      const fileCol = $('<div/>', {
        class: 'col-10 alert alert-info m-0 px-2 ',
        text: f
      });
      const deleteButtonCol = $('<div/>', {
        class: 'col-2 d-flex justify-content-center align-items-center px-2'
      });
      const deleteButton = $('<button/>', {
        class: 'btn btn-danger mb-0',
        type: 'button',
        html: '&times;',
        'data-toggle': 'collapse',
        'data-target': '#file-' + i //'#' + f
      });

      deleteButtonCol.append(deleteButton);
      collapsibleRow.append(fileRow.append(fileCol).append(deleteButtonCol));
      $('#files-list').append(collapsibleRow);
      collapsibleRow.on('transitionend', function () {
        if (window.isAllFilesRemoved()) {
          window.disableSignAll();
        }
      });
    });
  };

  window.isAllFilesRemoved = function () {
    return $('.collapse.show.file').length === 0;
  };

  window.showCollectedSignature = function (signature) {
    console.log('[window] showing collected signature', signature);
    const signatureImage = $('<img/>', {
      class: 'w-100',
      src: signature
    });
    $('#signature-view').empty().append(signatureImage);
  };

  window.enableSignAll = function () {
    $('#sign-all').attr('disabled', false);
  };

  window.disableSignAll = function () {
    $('#sign-all').attr('disabled', true);
  };

  window.fileSigned = function (file) {
    console.log('[window] file signed ', file);
    $('.show.file[data-basename="' + file + '"]')
      .children('.row')
      .children('.alert')
      .removeClass('alert-info')
      .addClass('alert-success');
  };
});
