'use strict';

module.exports = function (vinyl, plugins, options) {
  return function cssQualityTask() {
    // Default to false
    if (options.dieOnError !== true) {
      options.dieOnError = false;
    }

    return vinyl.src(options.src)
      .pipe(plugins.stylelint({
        failAfterError: options.dieOnError,
        reporters: [
          { formatter: 'string', console: true }
        ]
      }));
  };
};
