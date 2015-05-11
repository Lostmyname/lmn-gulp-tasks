'use strict';

var findNodeModules = require('find-node-modules');
var rev = require('../lib/rev');
var sassNpmImporter = require('../lib/sass-npm-importer');
var through = require('through2');

module.exports = function (gulp, plugins, options) {
  return function scssTask() {
    if (typeof options.minify !== 'boolean') {
      options.minify = process.env.MINIFY_ASSETS || false;
    }

    if (typeof options.sourcemaps !== 'boolean') {
      options.sourcemaps = process.env.SOURCEMAPS || true;
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
      .pipe(options.sourcemaps ? plugins.sourcemaps.init() : through.obj())

      // Sourcemap start
      .pipe(plugins.sass({
        imagePath: options.imagePath,
        includePaths: includePaths,
        importer: sassNpmImporter
      }))
      .on('error', options.onError) // For some reason gulp-plumber doesn't like -compass
      .pipe(plugins.autoprefixer())
      .pipe(options.minify ? plugins.minifyCss() : through.obj())
      .pipe(options.rev ? plugins.fingerprint('rev-manifest.json', {
        prefix: '/',
        mode: 'replace'
      }) : through.obj())
      // Sourcemap end

      .pipe(options.sourcemaps ? plugins.sourcemaps.write('./') : through.obj())
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
