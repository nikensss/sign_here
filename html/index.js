$(document).ready(() => {
  $('#pdf').click(() => {
    console.log('[window] requesting pdfs files');
    window.postMessage({
      type: Message.SELECT_FILES
    });
  });

  $('#signature').click(() => {
    console.log('[window] requesting signature image');
    window.postMessage({
      type: Message.SELECT_SIGNATURE
    });
  });

  $('#sign-all').click(() => {
    console.log('[window] requesting signature stamping');
    const files = $('.file.show')
      .map((i, e) => $(e).attr('data-basename'))
      .get();
    window.postMessage({
      type: Message.SIGN_ALL,
      files: files
    });
    $('#sign-all').attr('disabled', true);
  });

  window.showCollectedPdfs = function (pdfs) {
    $('#files-list').empty();
    console.log('[window] showing collected files ', pdfs);

    pdfs.forEach((pdf, i) => {
      const collapsibleRow = $('<div/>', {
        class: 'collapse show file',
        id: 'file-' + i,
        'data-basename': pdf
      });
      const fileRow = $('<div/>', {
        class: 'row p-3 justify-content-around align-items-center'
      });
      const fileCol = $('<div/>', {
        class: 'col-10 alert alert-info m-0 px-2 text-center',
        text: pdf
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

  window.fileNotSigned = function (file, reason) {
    console.log('[window] file not signed and reason', file, reason);
    $('.show.file[data-basename="' + file + '"]')
      .children('.row')
      .children('.alert')
      .removeClass('alert-info')
      .addClass('alert-danger');
  };

  window.addEventListener('message', (event) => {
    console.log('[window] received message of type', event.data.type);
    switch (event.data.type) {
      case Message.COLLECTED_PDFS:
        window.showCollectedPdfs(event.data.pdfs);
        break;
      case Message.COLLECTED_SIGNATURE:
        window.showCollectedSignature(event.data.signature);
        break;
      case Message.CAN_SIGN:
        window.enableSignAll();
        break;
      case Message.FILE_SIGNED:
        window.fileSigned(event.data.file);
        break;
      case Message.FILE_NOT_SIGNED:
        window.fileNotSigned(event.data.file, event.data.reason);
        break;
      case Message.EVERYTHING_SIGNED:
        window.alert('¡Ya está todo firmado!');
        break;
      default:
        console.log('[window] unknown type', event.data.type);
    }
  });

  window.postMessage({
    type: Message.LOAD_USER_DATA
  });
});
