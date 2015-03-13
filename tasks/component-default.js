'use strict';

var browserSync = require('browser-sync');

module.exports = function (gulp, plugins, options) {
  return function componentDefaultTask() {
    var config = {
      server: {
        baseDir: '.'
      },
      startPath: '/demo/index.html',
      ghostMode: {
        scroll: false,
        links: false,
        forms: false
      }
    };

    if (process.argv.indexOf('--no-open') !== -1) {
      config.open = false;
    }

    browserSync.init(options.reloadFiles || [
      'demo/build/**/*.css',
      'demo/build/**/*.js',
      'demo/**/*.html',
      'src/imgs/**/*',
      'test/**/*.js'
    ], config);

    if (typeof options.watch !== 'boolean' || options.watch) {
      gulp.watch('./src/scss/**/*.{sass,scss}', ['scss']);
      gulp.watch('./src/js/**/*.js', ['js']);
      gulp.watch('./src/partials/partial.erb.html', ['html']);
      gulp.watch('./demo/base.erb.html', ['html']);
    }
  };
};
