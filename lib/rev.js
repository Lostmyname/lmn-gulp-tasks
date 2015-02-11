'use strict';

var multipipe = require('multipipe');
var revDel = require('rev-del');
var through = require('through2');

/**
 * This is used in all the tasks that support revisioning: they just pipe to
 * the stream returned by this function, and that handles the revisioning,
 * the creation of a manifest file, and the deletion of old assets.
 *
 * To use:
 *
 * .pipe(rev(gulp, plugins, options))
 */
module.exports = function (gulp, plugins, options) {
  return options.rev ? multipipe(
    plugins.rev(),
    gulp.dest(options.dest),
    plugins.rev.manifest({
      base: options.dest,
      merge: true
    }),
    revDel({ force: true }),
    gulp.dest(options.dest)
  ) : through.obj();
};
