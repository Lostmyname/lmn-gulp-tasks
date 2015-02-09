'use strict';

var findNodeModules = require('find-node-modules');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function scssTask() {
    // Default to true
    if (options.minify !== false) {
      options.minify = true;
    }

    return gulp.src(options.src)
      .pipe(plugins.sass({
        imagePath: options.imagePath,
        includePaths: findNodeModules()
      }))
      .on('error', options.onError) // For some reason gulp-plumber doesn't like -compass
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.autoprefixer())
      .pipe(options.minify ? plugins.minifyCss() : plugins.util.noop())
      .pipe(options.rev ? plugins.fingerprint('rev-manifest.json', {
        prefix: '/',
        mode: 'replace'
      }) : plugins.util.noop())
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
