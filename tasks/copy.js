'use strict';

var rev = require('../lib/rev');
var through = require('through2');

module.exports = function (gulp, plugins, options) {
  return function copyTask() {
    return gulp.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.changed(options.dest, {
        hasChanged: plugins.changed.compareSha1Digest
      }))
      .pipe(options.flatten ? plugins.rename({ dirname: '' }) : through.obj())
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
