'use strict';

var through = require('through2');

module.exports = function (vinyl, plugins, options) {
  return function jsQualityTask() {
    // Default to false
    if (options.dieOnError !== true) {
      options.dieOnError = process.argv.indexOf('--fail') !== -1;
    }

    return vinyl.src(options.src)
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(options.dieOnError ? plugins.eslint.failOnError() : through.obj());
  };
};
