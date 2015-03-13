'use strict';

var path = require('path');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var through = require('through2');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  var basename = path.basename(options.dest);
  options.dest = path.dirname(options.dest);

  return function browserifyTask() {
    if (typeof options.minify !== 'boolean') {
      options.minify = process.env.MINIFY_ASSETS || false;
    }

    if (typeof options.sourcemaps !== 'boolean') {
      options.sourcemaps = process.env.SOURCEMAPS || true;
    }

    var ignore = options.ignoreSuckyAntipattern;

    var browserified = transform(function (filename) {
      var b = browserify({ entries: filename, debug: options.sourcemaps });
      return b.bundle();
    });

    return gulp.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(browserified)
      .pipe(plugins.rename(basename))
      .pipe(ignore ? through.obj() : plugins.contains('../node_modules'))
      .pipe(options.sourcemaps ? plugins.sourcemaps.init({ loadMaps: true }) : through.obj())

      // Sourcemaps start
      .pipe(options.minify ? plugins.uglify() : through.obj())
      .pipe(options.minify ? plugins.stripDebug() : through.obj())
      // Sourcemaps end

      .pipe(options.sourcemaps ? plugins.sourcemaps.write('./') : through.obj())
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
