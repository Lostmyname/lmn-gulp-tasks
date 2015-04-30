'use strict';

var path = require('path');
var fs = require('fs');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
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

    var bundler = browserify({
      entries: options.src,
      debug: options.sourcemaps
    });

    // Exclude the random versions of jQuery deps have required in
    bundler.exclude('jquery');

    // Add local jQuery only, if it exists
    if (options.jquery !== false) {
      var jqueryPath = path.join(process.cwd(), 'node_modules/jquery');

      if (fs.existsSync(path.join(jqueryPath, 'package.json'))) {
        bundler.require(jqueryPath);
      } else {
        console.log('jQuery couldn\'t be loaded, but that\'s okay');
      }
    }

    return bundler.bundle()
      .pipe(source(basename))
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(buffer())
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
