$(document).ready(() => {
  $('#pdf').click(() => {
    console.log('posting message');
    window.postMessage({
      type: 'select-dirs',
    });
  });
});
