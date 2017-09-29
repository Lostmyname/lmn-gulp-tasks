'use strict';

var through = require('through2');
var rev = require('../lib/rev');

module.exports = function (vinyl, plugins, options) {
  return function () {
    // Optimise SVGs
    var svgStream = vinyl
      .src(options.src)
      .pipe(plugins.plumber({ errorHandler: options.onError }))
      .pipe(options.flatten ? plugins.rename({ dirname: '' }) : through.obj())
      .pipe(plugins.changed(options.dest))
      .pipe(
        plugins.imagemin({
          svgoPlugins: [{ removeViewBox: false }, { removeDoctype: true }, { removeXMLProcInst: true }]
        })
      )
      .pipe(vinyl.dest(options.dest))
      .pipe(rev(vinyl, plugins, options));
    return svgStream;
  };
};
