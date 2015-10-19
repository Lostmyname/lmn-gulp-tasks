'use strict';

var path = require('path');
var fs = require('fs');
var babelify = require('babelify');
var browserify = require('browserify');
var reactify = require('reactify');
var envify = require('envify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var through = require('through2');
var resolve = require('resolve');
var _ = require('lodash');
var watchify = require('watchify');
var rev = require('../lib/rev');

module.exports = function (vinyl, plugins, options) {
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

    var opts = {
      debug: options.sourcemaps,
      ignore: ['jquery']
    };

    if (options.watch) {
      opts = _.assign({}, watchify.args, opts);
    }

    var bundler = browserify(opts);

    if (options.watch) {
      bundler = watchify(bundler);
      bundler.on('update', bundle);
      bundler.on('log', function (msg) {
        console.log('Browserify:', msg);
      });
    }

    bundler.transform(babelify.configure({
      blacklist: ['es6.classes'],
      loose: ['es6.modules'],
      ignore: /jquery\-browserify\.js/
    }));

    bundler.transform(envify);

    if (options.react) {
      bundler.transform(reactify);
    }

    // Add local jQuery only, if it exists
    if (options.jquery !== false) {
      try {
        var res = resolve.sync('jquery', { basedir: process.cwd() });
        var stream = fs.createReadStream(res);
        stream.file = 'jquery-browserify.js';
        bundler.require(stream);
      } catch (e) {
        if (e.message.indexOf('Cannot find module') !== -1) {
          console.log('jQuery couldn\'t be loaded, but that\'s okay');
        } else {
          throw e;
        }
      }
    }

    bundler.add(options.src);

    function bundle() {
      console.log('Browserify: Bundling');

      return bundler.bundle()
        .on('error', options.onError)
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
        .pipe(vinyl.dest(options.dest))
        .pipe(rev(vinyl, plugins, options));
    }

    return bundle();
  };
};
