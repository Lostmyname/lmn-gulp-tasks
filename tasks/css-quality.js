'use strict';

module.exports = function (vinyl, plugins, options) {
  return function cssQualityTask() {

    return vinyl.src(options.src)
      .pipe(plugins.stylelint({
        reporters: [
          { formatter: 'string', console: true }
        ]
      }));
  };
};
