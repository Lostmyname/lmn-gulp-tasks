'use strict';

var del = require('del');

module.exports = function (gulp, plugins, options) {
  return function cleanTask(cb) {
    del([].concat(options.src))
      .then((files) => cb(null, files))
      .catch(cb);
  };
};
