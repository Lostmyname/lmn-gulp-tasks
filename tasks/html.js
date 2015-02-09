'use strict';

var fs = require('fs');

var delve = require('delve');
var erbParser = require('rubbish-erb-parser');
var yaml = require('js-yaml');

module.exports = function (gulp, plugins, options) {
  return function htmlTask(done) {
    var base = fs.readFileSync('demo/base.erb.html', 'utf8');
    var partial = fs.readFileSync('src/partials/partial.erb.html', 'utf8');

    base = base.replace('<%= partial %>', partial);

    var lang = yaml.safeLoad(fs.readFileSync('src/en.yml', 'utf8'));

    erbParser.addHelper('t', function (options, text) {
      return delve(lang.en[options.langBase], text);
    });

    var erbOptions = { imagePath: '../../src/imgs/' };

    erbParser.renderString(base, erbOptions, options.context || {})
      .then(function (res) {
        fs.mkdir('demo/partials', function (err) {
          if (err && err.code !== 'EEXIST') {
            return done(err);
          }

          fs.writeFile('demo/partials/partial.html', res, function (err) {
            if (err) {
              return done(err);
            }

            done();
          });
        });
      })
      .catch(function (err) {
        done(err);
      });
  };
};
