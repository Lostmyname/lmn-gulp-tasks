'use strict';

var _ = require('lodash');
var jpegoptim = require('imagemin-jpegoptim');
var mergeStream = require('merge-stream');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function () {
    var images = gulp.src(options.src);
    var imageTasks = [];

    // Special case for retina images
    var stream = gulp.src(options.retinaSrc || getRetinaSrc(options.src))
      .pipe(handleRename('-xlarge'))
      .pipe(handleChanged())
      .pipe(handleOptimize())
      .pipe(gulp.dest(options.dest));

    imageTasks.push(stream);

    var sizes = options.sizes || { large: 100, medium: 66.7, small: 50 };

    // Deal with each size separately
    _.each(sizes, function (factor, suffix) {
      var stream = images.pipe(plugins.clone())
        .pipe(handleResize(factor))
        .pipe(handleRename('-' + suffix))
        .pipe(handleChanged())
        .pipe(handleOptimize())
        .pipe(gulp.dest(options.dest));

      imageTasks.push(stream);
    });

    return mergeStream.apply(this, imageTasks)
      .pipe(rev(gulp, plugins, options));
  };

  // Only handle images that need handling. Should be ran *after* handleRename
  function handleChanged() {
    return plugins.changed(options.dest, {
      hasChanged: function (stream, cb, file, destPath) {
        destPath = destPath.replace(/\d+[x-]\d+(?:@2x)?(?=(?:-[a-z]{2}(?:-[A-Z]{2})?)?\.[a-z]+$)/, 'small');
        plugins.changed.compareLastModifiedTime(stream, cb, file, destPath);
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
    return plugins.gm(function (gmfile) {
      var newFactor = _.contains(gmfile.source, '@2x') ? factor / 2 : factor;

      if (newFactor === 100) {
        return gmfile;
      }

      return gmfile.resize(newFactor, newFactor, '%');
    }, { imageMagick: true });
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
