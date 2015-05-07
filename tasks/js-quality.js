'use strict';

var stylish = require('jshint-stylish');
var through = require('through2');

module.exports = function (gulp, plugins, options) {
  return function jsQualityTask() {
    var stream = gulp.src(options.src);

    // Default to false
    if (options.dieOnError !== true) {
      options.dieOnError = process.argv.indexOf('--fail') !== -1;
    }

    if (!options.dieOnError) {
      stream = stream.pipe(plugins.plumber({ errorHandler: options.onError }));
    }

    var magicAllowed = options.magicAllowed || [0, 0.5, 1, 2];
    var runBuddy = (magicAllowed !== true);

    stream = stream.pipe(plugins.jscs())
      .pipe(runBuddy ? plugins.buddy({ ignore: magicAllowed }) : through.obj())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter(stylish));

    if (options.dieOnError) {
      stream = stream.pipe(plugins.jshint.reporter('fail'));
    }

    return stream;
  };
};
