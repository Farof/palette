"use strict";

(function (exports) {

  Object.defineProperties(Math, {
    randomInt: {
      value: function (min, max) {
        max = max ? max : (min || 100);
        min = arguments.length === 2 ? min : 0;
        if (min > max) {
          [min, max] = [max, min];
        }

        return Math.floor(min + Math.random() * (max - min + 1))
      }
    }
  });

  Object.defineProperties(MouseEvent.prototype, {
    stop: {
      value: function () {
        this.stopPropagation();
        this.preventDefault();
      }
    }
  });

  Object.defineProperties(Array.prototype, {
    all: {
      value: function (func) {
        var i, ln;

        for (i = 0, ln = this.length; i < ln; i += 1) {
          if (!func(this[i], i, this)) {
            return false;
          }
        }

        return true;
      }
    },

    include: {
      value: function (value) {
        if (this.indexOf(value) < 0) {
          this.push(value);
        }
        return this;
      }
    },

    remove: {
      value: function (value) {
        var index = this.indexOf(value);
        if (index > -1) {
          this.splice(index, 1);
        }
        return this;
      }
    }
  });

  Object.defineProperties(HTMLElement.prototype, {
    empty: {
      value: function () {
        while (this.childNodes[0]) {
          this.removeChild(this.childNodes[0]);
        }
        return this;
      }
    },

    dispose: {
      value: function () {
        this.parentNode.removeChild(this);
      }
    },

    getPos: {
      value: function (top) {
        var parentPos = this === (top || document.body) ? { x: 0, y: 0 } : this.offsetParent.getPos();
        return {
          x: this.offsetLeft + parentPos.x,
          y: this.offsetTop + parentPos.y
        }
      }
    },

    grab: {
      value: function (node) {
        this.appendChild(node);
        return this;
      }
    },

    adopt: {
      value: function (nodes) {
        nodes.forEach(this.grab.bind(this));
        return this;
      }
    },

    setDragAction: {
      value: function (action, options) {
        var
          container = options.container || document,
          mouseup = function (e) {
            container.removeEventListener('mousemove', action, false);
            container.removeEventListener('mouseup', mouseup, false);
          };

        action = action.bind(this);

        this.addEventListener('mousedown', function (e) {
          e.stop();
          container.addEventListener('mousemove', action, false);
          container.addEventListener('mouseup', mouseup, false);
        }, false);

        if (typeof options.mousedown === 'function') {
          this.addEventListener('mousedown', options.mousedown, false);
        }
        if (typeof options.mouseup === 'function') {
          this.addEventListener('mouseup', options.mouseup, false);
        }
      }
    },

    setAbsolute: {
      value: function (bound) {
        var
          pos = this.getPos(bound),
          boundPos;
        bound = bound || document.body;
        boundPos = bound.getPos();
        this.style.left = pos.x - boundPos.x + 'px';
        this.style.top = pos.y - boundPos.y + 'px';
        this.style.position = 'absolute';
      }
    }
  });

  var Element = exports.Element = function (tag, options) {
    var node = this.node = document.createElement(tag);

    this.applyMutator(options)
        .setAttributes(options);

    return node;
  };

  Object.defineProperties(Element.prototype, {
    setAttributes: {
      value: function (attributes) {
        var key;

        for (key in attributes) {
          this.node.setAttribute(key, attributes[key]);
        }

        return this;
      }
    },

    applyMutator: {
      value: function (mutators) {
        var key;

        for (key in mutators) {
          if (Element.Mutators.hasOwnProperty(key)) {
            Element.Mutators[key].call(this.node, mutators[key]);
            delete mutators[key];
          }
        }

        return this;
      }
    }
  });

  Element.Mutators = {
    text: function (value) {
      this.textContent = value;
    },

    Absolute: function (bound) {
      var self = this;
      document.addEventListener('DOMNodeInserted', function setAbsolute(e) {
        self.setAbsolute(bound);
        document.removeEventListener('DOMNodeInserted', setAbsolute, false);
      }, false);
    },

    Dragable: function (bound) {
      var
        offsetX,
        offsetY,
        boundPos = bound.getPos();

      bound.style.position = 'relative';

      this.setDragAction(function (e) {
        this.style.left = e.clientX - boundPos.x - offsetX + 'px';
        this.style.top = e.clientY - boundPos.y - offsetY + 'px';
      }, {
        mousedown: function (e) {
          var pos = this.getPos(bound);
          this.setAbsolute(bound);
          offsetX = e.clientX - boundPos.x - parseInt(this.style.left, 10);
          offsetY = e.clientY - boundPos.y - parseInt(this.style.top, 10);
          bound.appendChild(this);
        }
      })
    },

    properties: function (properties) {
      var key;

      for (key in properties) {
        this[key] = properties[key];
      }
    },

    events: function (events) {
      var key, callback, capture = false;

      for (key in events) {
        callback = events[key];
        if (Array.isArray(callback)) {
          capture = callback[1];
          callback = callback[0];
        }
        this.addEventListener(key, callback, capture);
      }
    }
  };

  Object.defineProperties(Function.prototype, {
    override: {
      value: function (override) {
        return override(this);
      }
    }
  });

  parseInt.override(function (old) {
    return function (str, base) {
      return old.call(this, str, base || 10);
    };
  });

}(this));
