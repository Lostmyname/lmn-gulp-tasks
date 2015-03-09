'use strict';

var path = require('path');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var through = require('through2');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  var basename = path.basename(options.dest);
  options.dest = path.dirname(options.dest);

  return function browserifyTask() {
    var bundler = browserify(options.src);

    var ignore = options.ignoreSuckyAntipattern;

    return bundler.bundle()
      .on('error', options.onError)
      .pipe(source(basename))
      .pipe(buffer())
      .pipe(ignore ? through.obj() : plugins.contains('../node_modules'))
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
