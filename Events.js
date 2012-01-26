"use strict";

(function (exports) {

  var Events = exports.Events = function () {
    var events = {};

    return {
      addListener: {
        value: function (name, func) {
          if (!events[name]) {
            events[name] = [];
          }
          if (typeof func === 'function') {
            events[name].include(func);
          }
          return this;
        }
      },

      fireEvent: {
        value: function (name, args) {
          var list = events[name];
          args = (typeof args !== 'undefined') ? (Array.isArray(args) ? args : [args]) : [];

          if (list) {
            list.forEach(function (func) {
              func.apply(this, args);
            }.bind(this));
          }

          return this;
        }
      },

      removeListener: {
        value: function (name, func) {
          var list = events[name];

          if (list) {
            if (typeof func !== 'undefined') {
              list.remove(func);
            } else {
              events[name] = [];
            }
          }
        }
      }
    };
  };

}(this));
