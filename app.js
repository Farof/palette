"use strict";

(function (exports) {

  window.addEventListener('DOMContentLoaded', function () {

    var
      defaultWidth = 100,
      defaultHeight = 100,
      app = exports.app = {
        colors: {},

        set: function (data, skip) {
          if (!skip) {
            updateAll();
            color.save();
          }
        },

        save: function () {
          localStorage.color = this.color;
        },

        load: function () {
          var savedColor = localStorage.color;

          if (savedColor) {
            try {
              savedColor = JSON.parse(savedColor);
              this.color = new Color(savedColor);
            } catch (e) {
              delete localStorage.color;
            }
          }

          if (!this.color) {
            this.color = new Color();
          }
        },

        saveColors: function () {
          localStorage.colors = JSON.stringify(Object.keys(this.colors));
        },

        loadColors: function () {
          var
            colorsNode = document.getElementById('colors'),
            colors = localStorage.colors,
            node;

          if (colors) {
            try {
              colors = JSON.parse(colors);
              if (Array.isArray(colors)) {
                colorsNode.empty();
                colors.forEach(function (rgba) {
                  node = new SavedColor({ color: rgba });
                  colorsNode.grab(node);
                  this.addSaved(node);
                }.bind(this));
              }
            } catch (e) {
              delete localStorage.colors;
            }
          }
        },

        addSaved: function (node) {
          this.colors[node.color] = node;
          this.saveColors();
        },

        removeSaved: function (node, colorNode) {
          var has = !!this.colors[node.color];
          if (has) {
            colorNode.dispose();
            node.dispose();
            delete this.colors[node.color];
            this.saveColors();
          }
        },

        removeAllSaved: function () {
          this.colors = {};
          delete localStorage.colors;
          document.getElementById('colors').empty();
        },

        reset: function () {
          this.color.set(new Color());
          this.removeAllSaved();
        },

        canvasMap: {
          redGreen: {
            box: document.querySelector('#row1 > .col1'),
            target: document.querySelector('#row1 > .col1 > .target'),
            i: 'red',
            j: 'green',
            f1: 'blue',
            f2: 'alpha'
          },
          blueAlpha: {
            box: document.querySelector('#row2 > .col1'),
            target: document.querySelector('#row2 > .col1 > .target'),
            i: 'blue',
            j: 'alpha',
            f1: 'red',
            f2: 'green'
          },
          redBlue: {
            box: document.querySelector('#row1 > .col2'),
            target: document.querySelector('#row1 > .col2 > .target'),
            i: 'red',
            j: 'blue',
            f1: 'green',
            f2: 'alpha'
          },
          greenAlpha: {
            box: document.querySelector('#row2 > .col2'),
            target: document.querySelector('#row2 > .col2 > .target'),
            i: 'green',
            j: 'alpha',
            f1: 'red',
            f2: 'blue'
          },
          greenBlue: {
            box: document.querySelector('#row1 > .col3'),
            target: document.querySelector('#row1 > .col3 > .target'),
            i: 'green',
            j: 'blue',
            f1: 'red',
            f2: 'alpha'
          },
          redAlpha: {
            box: document.querySelector('#row2 > .col3'),
            target: document.querySelector('#row2 > .col3 > .target'),
            i: 'red',
            j: 'alpha',
            f1: 'green',
            f2: 'blue'
          }
        },

        init: function () {
          var config, key;

          this.load();
          this.loadColors();

          this.color.addListener('change', function () {
            this.updateAll();
            this.save();
          }.bind(this));

          for (key in this.canvasMap) {
            config = this.canvasMap[key];

            config.canvas = new Element('canvas', {
              width: config.width || defaultWidth,
              height: config.height || defaultHeight
            });
            config.ctx = config.canvas.getContext('2d');
            config.box.grab(config.canvas);

            this.configureCanvas(this.canvasMap[key], key);
          }
          this.configureInfos();
          this.updateAll();
          this.save();
        },

        updateCanvas: function (config, key, usedConfig) {
          var
            i, j, index,
            img = config.ctx.createImageData(config.canvas.width, config.canvas.height);

          for (i = 0; i < config.canvas.width; i += 1) {
            for (j = 0; j < config.canvas.height; j += 1) {
              index = (i + j * config.canvas.width) * 4;
              img.data[index + Color.channel[config.i]] = (i / (config.canvas.width - 1)) * 255;
              img.data[index + Color.channel[config.j]] = (j / (config.canvas.width - 1)) * 255;
              img.data[index + Color.channel[config.f1]] = this.color[config.f1];
              img.data[index + Color.channel[config.f2]] = this.color[config.f2];
            }
          }

          config.ctx.putImageData(img, 0, 0);
        },

        updateTarget: function (config, key) {
          config.target.style.left = (this.color[config.i] / 256 * config.canvas.width) + 'px';
          config.target.style.top = (this.color[config.j] / 256 * config.canvas.height) + 'px';
        },

        demo: document.getElementById('demo'),
        updateDemo: function () {
          this.demo.style.backgroundColor = this.color.toRGBA();
        },

        rgba: document.getElementById('rgba'),
        hex: document.getElementById('hex'),
        hsv: document.getElementById('hsv'),
        updateInfos: function (config, used) {
          this.rgba.value = this.color.toRGBA();
          this.hex.value = this.color.toHex();
          this.hsv.value = this.color.toHSV();
        },

        updateAll: function (usedConfig, usedKey) {
          var config, key;

          for (key in this.canvasMap) {
            config = this.canvasMap[key];
            if (usedKey !== key) {
              this.updateCanvas(config, key, usedConfig);
            }
            this.updateTarget(config, key, usedConfig);
          }

          this.updateDemo(config, usedKey);
          this.updateInfos(config, usedKey);
        },

        configureCanvas: function (config, key) {
          var
          box = config.box,
          pos = box.getPos(),
          move = function (e) {
            var
              x = Math.min(Math.max(e.clientX - pos.x, 5) - 5, config.canvas.width),
              y = Math.min(Math.max(e.clientY - pos.y, 5) - 5, config.canvas.height),
              settings = {};

            // console.log('update: ', x, y, Math.round(x / config.canvas.width * 255), Math.round(y / config.canvas.height * 255));

            // Si touche Y enfoncée on bloque l'axe X
            if (!shortcut.keypressed['89']) {
              settings[config.i] = Math.round(x / config.canvas.width * 255);
            }
            // Si touche X enfoncée on bloque l'axe Y
            if (!shortcut.keypressed['88']) {
              settings[config.j] = Math.round(y / config.canvas.height * 255);
            }

            this.color.set(settings);
          }.bind(this);

          config.box.setDragAction(move, {
            mouseup: function () {
              //updateAll(config, key);
              //color.save();
            }
          });
          config.box.addEventListener('click', move, false);
        },

        configureInfos: function () {
          this.hex.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
              this.color.fromHex(this.hex.value);
            } else if (e.keyCode === 88 || e.keyCode === 89) {
              e.preventDefault();
            }
          }.bind(this), false);

          this.rgba.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
              this.color.fromRGBA(this.rgba.value);
            } else if (e.keyCode === 88 || e.keyCode === 89) {
              e.preventDefault();
            }
          }.bind(this), false);

          document.getElementById('save').addEventListener('click', function () {
            var node = new SavedColor({ color: this.color.toRGBA() });
            document.getElementById('colors').grab(node);

            this.addSaved(node);
          }.bind(this), false);

          document.getElementById('scramble').addEventListener('click', function () {
            this.color.scramble(true);
          }.bind(this), false);

          document.getElementById('reverse').addEventListener('click', function () {
            this.color.reverse();
          }.bind(this), false);

          document.getElementById('reset').addEventListener('click', function () {
            this.reset();
          }.bind(this), false);
        }
      };

    app.init();

  }, false);

}(this));
