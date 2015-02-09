'use strict';

var spawn = require('child_process').spawn;

// Run this when you're working on the Gulpfile. Otherwise, do not use.
module.exports = function (gulp) {
  return function autoReloadTask(options) {
    var process;
    var args = ['default'];

    function restart() {
      if (process) {
        process.kill();
      }

      process = spawn('gulp', args, { stdio: 'inherit' });
    }

    gulp.watch('gulpfile.js', restart);
    restart();

    if (typeof options === 'object' && Array.isArray(options.addArgs)) {
      args = args.concat(options.addArgs);
    }
  };
};
