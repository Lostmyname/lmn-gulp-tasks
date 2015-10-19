'use strict';

var path = require('path');
var findup = require('findup-sync');
var rev = require('../lib/rev');

module.exports = function (vinyl, plugins, options) {
  return function () {
    try {
      var src = path.join(findup('node_modules/' + options.module), options.src);
    } catch (e) {
      if (e.message.indexOf('Received null')) {
        throw new Error('Module ' + options.module + ' not found');
      } else {
        throw e;
      }
    }

    return vinyl.src(src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.rename({ dirname: '' }))
      .pipe(vinyl.dest(options.dest))
      .pipe(rev(vinyl, plugins, options));
  };
};
