'use strict';

var rev = require('../lib/rev');
var through = require('through2');

module.exports = function (vinyl, plugins, options) {
  return function copyTask() {
    return vinyl.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.changed(options.dest, {
        hasChanged: plugins.changed.compareSha1Digest
      }))
      .pipe(options.flatten ? plugins.rename({ dirname: '' }) : through.obj())
      .pipe(vinyl.dest(options.dest))
      .pipe(rev(vinyl, plugins, options));
  };
};
