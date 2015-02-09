'use strict';

var path = require('path');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function scssTask() {
    // Default to true
    if (options.minify !== false) {
      options.minify = true;
    }

    return gulp.src(options.src)
      .pipe(plugins.compass({
        css: options.dest,
        sass: path.dirname(options.src)
      }))
      .on('error', options.onError) // For some reason gulp-plumber doesn't like -compass
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.autoprefixer())
      .pipe(options.minify ? plugins.minifyCss() : plugins.util.noop())
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
