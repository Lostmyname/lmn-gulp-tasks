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
 * .pipe(rev(vinyl, plugins, options))
 */
module.exports = function (vinyl, plugins, options) {
  var manifestSpecified = !!options.manifest;
  if (!options.manifest) {
    options.manifest = process.cwd();
  }

  var manifest = path.join(options.manifest, 'rev-manifest.json');

  return options.rev ? multipipe(
    plugins.clone(),
    plugins.rev(),
    vinyl.dest(options.dest),
    plugins.rev.manifest(manifest, {
      base: manifestSpecified ? options.manifest : undefined,
      merge: true
    }),
    revDel({ force: true, dest: options.manifest }),
    vinyl.dest(options.manifest)
  ) : through.obj();
};
