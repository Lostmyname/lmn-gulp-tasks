'use strict';

var path = require('path');
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
  options.manifest = options.manifest || process.env.MANIFEST_DEST;

  var manifestSpecified = !!options.manifest;
  if (!options.manifest) {
    options.manifest = process.cwd();
  }

  var manifest = path.join(options.manifest, 'rev-manifest.json');

  return options.rev ? multipipe(
    plugins.clone(),
    plugins.rev(),
    gulp.dest(options.dest),
    plugins.rev.manifest(manifest, {
      base: manifestSpecified ? options.manifest : undefined,
      merge: true
    }),
    revDel({ force: true, dest: options.manifest }),
    gulp.dest(options.manifest)
  ) : through.obj();
};
