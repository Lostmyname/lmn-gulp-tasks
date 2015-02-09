'use strict';

var path = require('path');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
	return function browserifyTask() {
		var bundler = browserify(options.src);
    var basename = path.basename(options.dest);
    options.dest = path.dirname(options.dest);

		return bundler.bundle()
      .on('error', options.onError)
      .pipe(source(basename))
      .pipe(gulp.dest(options.dest))
      .pipe(buffer())
      .pipe(rev(gulp, plugins, options));
	};
};
