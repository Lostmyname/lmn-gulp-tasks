'use strict';

var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

module.exports = function (gulp, plugins, options) {
	return function browserifyTask() {
		var bundler = browserify(options.src);

		return bundler.bundle()
			.on('error', options.onError)
			.pipe(source(path.basename(options.dest)))
			.pipe(gulp.dest(path.dirname(options.dest)));
	};
};
