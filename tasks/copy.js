'use strict';

var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function copyTask() {
    return gulp.src(options.src)
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
