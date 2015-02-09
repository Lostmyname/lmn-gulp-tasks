'use strict';

var del = require('del');

module.exports = function (gulp, plugins, options) {
  return function cleanTask(cb) {
    del(Array.isArray(options) ? options.src : [options.src], cb);
  };
};
