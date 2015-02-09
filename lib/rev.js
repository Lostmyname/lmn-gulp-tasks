'use strict';

var multipipe = require('multipipe');
var revDel = require('rev-del');
var through = require('through2');

module.exports = function (gulp, plugins, options) {
  return options.rev ? multipipe(
    plugins.rev(),
    gulp.dest(options.dest),
    plugins.rev.manifest({
      base: options.dest,
      merge: true
    }),
    revDel(),
    gulp.dest(options.dest)
  ) : through.obj();
};
