'use strict';

var path = require('path');
var findup = require('findup-sync');

var cache = {};

function sassNpmImporter(url, prev, done) {
  if (cache[url]) {
    return done({ file: cache[url] });
  }

  if (url[0] === '.' || url.indexOf('/') !== -1) {
    return done({ file: url });
  }

  try {
    var module = path.join('node_modules', url);
    var modulePath = findup(module, { cwd: path.dirname(prev), nocase: true });

    var moduleJson = require(path.join(modulePath, 'package.json'));
    var sassPath = path.join(modulePath, moduleJson.mainSass);

    cache[url] = sassPath;

    return done({ file: sassPath });
  } catch (e) {
    return done({ file: url });
  }
}

module.exports = sassNpmImporter;
