'use strict';

var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function copyTask() {
    return gulp.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
