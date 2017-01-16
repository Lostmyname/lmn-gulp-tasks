'use strict';

var _ = require('lodash');
var jpegoptim = require('imagemin-jpegoptim');
var mergeStream = require('merge-stream');
var rev = require('../lib/rev');
var through = require('through2');
var gm = require('gm').subClass({ imageMagick: true });
var path = require('path');


module.exports = function (vinyl, plugins, options) {
  return function () {
    var images = vinyl.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }));
    var imageTasks = [];

    // Special case for retina images
    var stream = vinyl.src(options.retinaSrc || getRetinaSrc(options.src))
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(handleRename('@2x'))
      .pipe(handleChanged())
      .pipe(plugins.if(!options.skipOptimize, handleOptimize()))
      .pipe(vinyl.dest(options.dest));

    imageTasks.push(stream);

    var sizes = options.sizes || { large: 100 };

    // Deal with each size separately
    _.each(sizes, function (factor) {
      var stream = images.pipe(plugins.clone())
        .pipe(through.obj(function (file, enc, cb) {
          file.originalPath = file.path;
          cb(null, file);
        }))
        .pipe(handleRename(''))
        .pipe(handleChanged())
        .pipe(plugins.if(!options.skipResize, handleResize(factor)))
        .pipe(plugins.if(!options.skipOptimize, handleOptimize()))
        .pipe(vinyl.dest(options.dest));

      imageTasks.push(stream);
    });

    return mergeStream.apply(this, imageTasks)
      .pipe(rev(vinyl, plugins, options));
  };

  // Only handle images that need handling. Should be ran *after* handleRename
  function handleChanged() {
    return plugins.changed(options.dest, {
      hasChanged: function (stream, cb, file, destPath) {
        var manifestPath = options.manifest || process.cwd();
        var manifest = require(path.join(manifestPath, 'rev-manifest.json'));

        destPath = destPath.replace(/\d+[x-]\d+(?:@2x)?(?=(?:-[a-z]{2}(?:-[A-Z]{2})?)?\.[a-z]+$)/, 'small');

        if (!manifest[path.basename(destPath)]) {
          stream.push(file);
          cb();
        } else {
          plugins.changed.compareLastModifiedTime(stream, cb, file, destPath);
        }
      }
    });
  }

  // Rename the image from something like file-10x10.jpg to file-small.jpg
  function handleRename(suffix) {
    return plugins.rename(function (path) {
      var matches = /^(.+)\-\d+[x-]\d+(?:@2x)?(?:(-[a-z]{2}(?:-[A-Z]{2})?))?$/.exec(path.basename);

      if (!matches) {
        var error = 'Failed to parse file name: ' + path.basename;
        throw new plugins.util.PluginError('lmn-gulp-tasks', error);
      }

      path.basename = matches[1] + suffix + (matches[2] || '');
      if (options.flatten) {
        path.dirname = '';
      }
    });
  }

  // Use gulp-gm to resize the image
  function handleResize(factor) {
    return through.obj(function (file, enc, cb) {
      var newFactor = _.includes(file.originalPath, '@2x') ? factor / 2 : factor;

      if (newFactor === 100) {
        return cb(null, file);
      }

      gm(file.contents, file.path)
        .resize(newFactor, newFactor, '%')
        .toBuffer(function (err, buffer) {
          if (err) {
            return cb(err);
          }

          file.contents = buffer;
          cb(null, file);
        });
    });
  }

  // Compress images
  function handleOptimize() {
    function losslessTest(file) {
      if (_.isFunction(options.lossless)) {
        return options.lossless(file);
      }

      return options.lossless;
    }

    var lossyStream = plugins.imagemin({ use: [jpegoptim({ max: 80 })] });
    var losslessStream = plugins.imagemin({ progressive: true });

    return plugins.if(losslessTest, losslessStream, lossyStream);
  }

  // Work out src for retina images
  function getRetinaSrc(src) {
    if (_.isArray(src)) {
      return _.map(src, getRetinaSrc);
    }

    return src.replace('*.{', '*@2x*.{');
  }
};
