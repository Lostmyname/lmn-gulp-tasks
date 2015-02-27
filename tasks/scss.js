'use strict';

var findNodeModules = require('find-node-modules');
var rev = require('../lib/rev');
var through = require('through2');

module.exports = function (gulp, plugins, options) {
  return function scssTask() {
    // Default to true
    if (options.minify !== false) {
      options.minify = true;
    }

    var includePaths;
    if (options.includePaths === false) {
      includePaths = [];
    } else {
      includePaths = findNodeModules({ relative: false });

      if (Array.isArray(options.includePaths)) {
        includePaths = includePaths.concat(options.includePaths);
      }
    }

    var ignore = options.ignoreSuckyAntipattern;

    return gulp.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(ignore ? through.obj() : plugins.contains('../node_modules'))
      .pipe(plugins.sass({
        imagePath: options.imagePath,
        includePaths: includePaths
      }))
      .on('error', options.onError) // For some reason gulp-plumber doesn't like -compass
      .pipe(plugins.autoprefixer())
      .pipe(options.minify ? plugins.minifyCss() : through.obj())
      .pipe(options.rev ? plugins.fingerprint('rev-manifest.json', {
        prefix: '/',
        mode: 'replace'
      }) : through.obj())
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
