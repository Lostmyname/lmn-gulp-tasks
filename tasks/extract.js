'use strict';

var path = require('path');
var findup = require('findup-sync');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function () {
    var src = path.join(findup('node_modules/' + options.module), options.src);

    return gulp.src(src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(plugins.rename({ dirname: '' }))
      .pipe(gulp.dest(options.dest))
      .pipe(rev(gulp, plugins, options));
  };
};
