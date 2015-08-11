'use strict';

var _ = require('lodash');
var jpegoptim = require('imagemin-jpegoptim');
var mergeStream = require('merge-stream');
var rev = require('../lib/rev');

module.exports = function (gulp, plugins, options) {
  return function () {
    var images = gulp.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }));
    var imageTasks = [];

    // Special case for retina images
    var stream = gulp.src(options.retinaSrc || getRetinaSrc(options.src))
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(handleRename('-xlarge'))
      .pipe(handleChanged())
      .pipe(plugins.if(!options.skipOptimize, handleOptimize()))
      .pipe(gulp.dest(options.dest));

    imageTasks.push(stream);

    var sizes = options.sizes || { large: 100, medium: 66.7, small: 50 };

    // Deal with each size separately
    _.each(sizes, function (factor, suffix) {
      var stream = images.pipe(plugins.clone())
        .pipe(through.obj(function(file, enc, cb) {
          this.originalPath = file.path;
          cb();
        }))
        .pipe(handleRename('-' + suffix))
        .pipe(handleChanged())
        .pipe(plugins.if(!options.skipResize, handleResize(factor)))
        .pipe(plugins.if(!options.skipOptimize, handleOptimize()))
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
      // Instead of looking at the source we need to check the originalPath
      // however this doesn't seem to Work
      // console.log(gmfile.source, gmfile.originalPath);
      // console.log("Source", _.contains(gmfile.source, '@2x'));
      // console.log("Original Path", _.contains(gmfile.originalPath, '@2x'));
      // var newFactor = _.contains(gmfile.originalPath, '@2x') ? factor / 2 : factor;

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
