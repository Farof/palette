"use strict";

(function (exports) {

  var SavedColor = exports.SavedColor = function (options) {
    var box, color, reverse;

    options = options || {};
    options.color = options.color || 'black'
    reverse = Color.fromRGBA(options.color).reverse().toHex();

    box = new Element('div', {
      class: 'saved-color-box',
      properties: {
        color: options.color
      }
    });

    color = new Element('div', {
      Dragable: document.getElementById('colors'),
      class: 'saved-color',
      style: 'background-color: ' + options.color + ';',
      events: {
        dblclick: function (e) {
          app.color.fromRGBA(options.color);
        }
      }
    }).grab(
      new Element('span', {
        class: 'close',
        text: 'x',
        style: 'border-color: ' + reverse + '; color: ' + reverse + ';',
        events: {
          click: function (e) {
            e.stop();
            app.removeSaved(box, color);
          }
        }
      })
    );

    return box.grab(color);
  };

}(this));