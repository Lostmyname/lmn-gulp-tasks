'use strict';

var fs = require('fs');
var _ = require('lodash');
var through = require('through2');

var locales = ['en-US', 'de', 'en-GB']; // en-GB is blank in paths

module.exports = function (vinyl, plugins, options) {
  function wrap(locale) {
    return (locale === 'en-GB' ? '' : '-' + locale) + '.';
  }

  return function () {
    if (!options.locales) {
      options.locales = locales;
    }

    var localesGlob = _.map(options.locales, function (locale) {
      return options.src + '/**/*-' + locale + '.{png,jpg}';
    });

    var errors = false;

    return vinyl.src(localesGlob, { read: false })
      .pipe(plugins.plumber({
        errorHandler: function (err) {
          plugins.util.log(plugins.util.colors.red(err.message));
        }
      }))
      .pipe(through.obj(function (file, enc, cb) {
        var path = file.relative;
        var failWithError = null;

        var fileLocale = _.filter(options.locales, function (locale) {
          var posFromEnd = path.length - path.lastIndexOf(wrap(locale));
          return (posFromEnd === 5 + locale.length);
        })[0];

        var fails = _.filter(options.locales, function (testLocale) {
          if (fileLocale === testLocale) {
            return false; // Obviously exists, no point testing
          }

          var pathShouldExist = path.replace(wrap(fileLocale), wrap(testLocale));
          return !fs.existsSync(options.src + '/' + pathShouldExist);
        });

        fails.forEach(function (failLocale) {
          errors = true;

          var error = 'No "' + failLocale + '" file found for ' + path;
          failWithError = new plugins.util.PluginError('LocaleChecker', error);
        });

        this.push(file);

        return cb(failWithError);
      }))
      .on('end', function () {
        if (!errors) {
          var success = 'Success: no missing locale files detected';
          plugins.util.log(plugins.util.colors.green(success));
        }
      });
  };
};
