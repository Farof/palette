"use strict";

(function (exports) {

  var Color = exports.Color = function (options) {
    options = options || {};
    this.red = options.red;
    this.green = options.green;
    this.blue = options.blue;
    this.alpha = options.alpha;
  };

  Object.defineProperties(Color.prototype, new Events());

  Object.defineProperties(Color.prototype, {
    _red:   { writable: true, enumerable: false, value: 0   },
    _green: { writable: true, enumerable: false, value: 0   },
    _blue:  { writable: true, enumerable: false, value: 0   },
    _alpha: { writable: true, enumerable: false, value: 255 },

    red: {
      get: function () {
        return this._red;
      },
      set: function (value) {
        var changed;

        value = typeof value === 'number' ? Math.max(0, Math.min(value, 255)) : this._red;
        changed = value !== this._red;

        this._red = value;
        
        if (changed) {
          this.fireEvent('change:red');
        }
      },
      enumerable: true
    },

    green: {
      get: function () {
        return this._green;
      },
      set: function (value) {
        var changed;

        value = typeof value === 'number' ? Math.max(0, Math.min(value, 255)) : this._green;
        changed = value !== this._green;

        this._green = value;
        
        if (changed) {
          this.fireEvent('change:green');
        }
      },
      enumerable: true
    },

    blue: {
      get: function () {
        return this._blue;
      },
      set: function (value) {
        var changed;

        value = typeof value === 'number' ? Math.max(0, Math.min(value, 255)) : this._blue;
        changed = value !== this._blue;

        this._blue = value;
        
        if (changed) {
          this.fireEvent('change:blue');
        }
      },
      enumerable: true
    },

    alpha: {
      get: function () {
        return this._alpha;
      },
      set: function (value) {
        var changed;

        value = typeof value === 'number' ? Math.max(0, Math.min(value, 255)) : this._alpha;
        changed = value !== this._alpha;

        this._alpha = value;

        if (changed) {
          this.fireEvent('change:alpha');
        }
      },
      enumerable: true
    },

    serialize: {
      value: function () {
        return {
          red: this.red,
          green: this.green,
          blue: this.blue,
          alpha: this.alpha
        };
      }
    },

    set: {
      value: function (data) {
        var changed = (typeof data.red    === 'number'  && data.red   !== this.red)
                   || (typeof data.green  === 'number'  && data.green !== this.green)
                   || (typeof data.blue   === 'number'  && data.blue  !== this.blue)
                   || (typeof data.alpha  === 'number'  && data.alpha !== this.alpha);

        this.red = data.red;
        this.green = data.green;
        this.blue = data.blue;
        this.alpha = data.alpha;

        if (changed) {
          this.fireEvent('change');
        }
        return this;
      }
    },

    scramble: {
      value: function (opaque) {
        this.set({
          red: Math.randomInt(255),
          green: Math.randomInt(255),
          blue: Math.randomInt(255),
          alpha: opaque ? 255 : Math.randomInt(255)
        });
        return this;
      }
    },

    reverse: {
      value: function () {
        this.set({
          red: 255 - this.red,
          green: 255 - this.green,
          blue: 255 - this.blue
        });
        return this;
      }
    },

    toCommaList: {
      value: function () {
        var alpha = (this.alpha / 255).toFixed(2);
        return this.red + ', ' + this.green + ', ' + this.blue + ', ' + (alpha === '1.00' ? '1' : alpha);
      }
    },

    toRGBA: {
      value: function () {
        return 'rgba(' + this.toCommaList() + ')';
      }
    },

    toHex: {
      value: function () {
        return '#' + Color.toHexPart(this.red) + Color.toHexPart(this.green) + Color.toHexPart(this.blue);
      }
    },

    toHSV: {
      value: function () {
        // console.log('HSV output not supported yet');
        return 'HSV';
      }
    },

    fromRGBA: {
      value: function (rgba) {
        var color = Color.fromRGBA(rgba);
        if (color) {
          this.set(color);
        }
        return this;
      }
    },

    fromHex: {
      value: function (h) {
        var color = Color.fromHex(h);
        if (color) {
          this.set(color);
        }
        return this;
      }
    },

    fromHSV: {
      value: function (hsv) {
        var color = Color.fromHSV(hsv);
        if (color) {
          this.set(color);
        }
        return this;
      }
    },

    clone: {
      value: function () {
        return new Color(this);
      }
    },

    toString: {
      value: function () {
        return JSON.stringify(this.serialize());
      }
    }
  });

  Object.defineProperties(Color, {
    toHexPart: {
      value: function (p) {
        p = parseInt(p, 10);
        if (isNaN(p)) {
          return '00';
        }
        return '0123456789ABCDEF'.charAt((p - p % 16) / 16) +
               '0123456789ABCDEF'.charAt(p % 16)
      }
    },

    rgbaReg: {
      value: /^(?:rgba\()?((?:\d{1,3},?(?:\s*)?){3})(?:,?(?:\s*)?(1|0(?:\.\d+)?))?\)?;?$/
    },

    hexReg: {
      value: /^(#?)[\dabcdefABCDEF]{6}$/
    },

    hsvReg: {
      value: /^.*$/
    },

    cutHex: {
      value: function (h) {
        return h.charAt(0) === '#' ? h.substring(1,7) : h;
      }
    },

    isRGBA: {
      value: function (rgba) {
        var matches;

        if (!this.rgbaReg.test(rgba)) {
          return false;
        } else {
          matches = this.rgbaReg.exec(rgba);
          if (matches && matches[1]) {
            return matches[1].replace(/(,\s|\s|,)/g, ':').split(':').every(function (match, index) {
              return match >= 0 && match <= 255;
            }) && (matches[2] ? (matches[2] >= 0 && matches[2] <= 1) : true);
          }
          return false;
        }
      }
    },

    isHex: {
      value: function (h) {
        return this.hexReg.test(h);
      }
    },

    isHSV: {
      value: function (hsv) {
        return this.hsvReg.test(hsv);
      }
    },

    fromRGBA: {
      value: function (rgba) {
        var matches, matchesRGB, alpha;

        if (this.isRGBA(rgba)) {
          matches = this.rgbaReg.exec(rgba), matchesRGB = matches[1].replace(/(,\s|\s|,)/g, ':').split(':');
          alpha = Number(matches[2]);
          return new Color({
            red: parseInt(matchesRGB[0], 10),
            green: parseInt(matchesRGB[1], 10),
            blue: parseInt(matchesRGB[2], 10),
            alpha: (typeof alpha === 'number') ? (alpha * 255) : 255
          });
        }
        return null;
      }
    },

    fromHex: {
      value: function (h) {
        if (this.isHex(h)) {
          return new Color({
            red: parseInt(this.cutHex(h).substring(0, 2), 16),
            green: parseInt(this.cutHex(h).substring(2, 4), 16),
            blue: parseInt(this.cutHex(h).substring(4, 6), 16),
            alpha: 255
          });
        }
        return null;
      }
    },

    fromHSV: {
      value: function (hsv) {
        var matches;

        if (this.isHex(hsv)) {
          matches = this.hsvReg.exec(hsv);
          return new Color({
            
          });
        }
        return null;
      }
    },

    channel: {
      value: {
        red:    0,
        green:  1,
        blue:   2,
        alpha:  3
      }
    }
  });

}(this))
