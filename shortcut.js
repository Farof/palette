(function (exports) {

  var shortcut = exports.shortcut = {
    keypressed: {}
  };

  window.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('keydown', function (e) {
      shortcut.keypressed.ALT = !!e.altKey;
      shortcut.keypressed.CTRL = !!e.ctrlKey;
      shortcut.keypressed.SHIFT = !!e.shiftKey;

      shortcut.keypressed[e.keyCode] = true;
    }, true);

    document.addEventListener('keyup', function (e) {
      shortcut.keypressed.ALT = !!e.altKey;
      shortcut.keypressed.CTRL = !!e.ctrlKey;
      shortcut.keypressed.SHIFT = !!e.shiftKey;

      shortcut.keypressed[e.keyCode] = false;
    }, true);

  }, false);

}(this));
