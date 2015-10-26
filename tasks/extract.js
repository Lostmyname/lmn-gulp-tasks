'use strict';

var path = require('path');
var findup = require('findup-sync');
var rev = require('../lib/rev');

module.exports = function (vinyl, plugins, options) {
  return function () {
    var module = findup('node_modules/' + options.module);
    if (!module) {
      throw new Error('Module ' + options.module + ' not found');
    }

    return vinyl.src(path.join(module, options.src))
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.rename({ dirname: '' }))
      .pipe(vinyl.dest(options.dest))
      .pipe(rev(vinyl, plugins, options));
  };
};
