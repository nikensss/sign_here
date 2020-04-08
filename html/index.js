$(document).ready(() => {
  $("#target").text("I am using jQuery and Bootstrap!");
  let buttonsClicked = (() => {
    let state = {
      pdf: false,
      signature: false
    };
    console.log(`state is ${state.pdf} and ${state.signature}`);

    function checkState() {
      console.log(`state is ${state.pdf} and ${state.signature}`);
      $("#sign").prop('disabled', !(state.pdf && state.signature));
    }
    return {
      pdf: s => {
        if (s) {
          state.pdf = s;
          checkState();
          return;
        }
        return state.pdf;
      },
      signature: s => {
        if (s) {
          state.signature = s;
          checkState();
          return;
        }
        return state.signature;
      }
    };
  })();

  $("#pdf").click(() => buttonsClicked.pdf(true));
  $("#signature").click(() => buttonsClicked.signature(true));
});