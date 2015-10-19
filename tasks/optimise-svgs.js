'use strict';

var mergeStream = require('merge-stream');
var through = require('through2');
var rev = require('../lib/rev');

module.exports = function (vinyl, plugins, options) {
  return function () {

    // Optimise SVGs
    var svgStream = vinyl.src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(options.flatten ? plugins.rename({ dirname: '' }) : through.obj())
      .pipe(plugins.changed(options.dest))
      .pipe(plugins.imagemin({ svgoPlugins: [{ removeViewBox: false }] }))
      .pipe(vinyl.dest(options.dest));

    // Make optimised PNG fallbacks
    var pngStream = svgStream.pipe(plugins.svg2png())
      .pipe(plugins.rename({ extname: '.png' }))
      .pipe(plugins.imagemin({ progressive: true }))
      .pipe(vinyl.dest(options.dest));

    return mergeStream(pngStream, svgStream)
      .pipe(rev(vinyl, plugins, options));
  };
};
