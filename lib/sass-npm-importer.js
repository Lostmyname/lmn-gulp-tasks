'use strict';

var path = require('path');
var findup = require('findup-sync');

var cache = {};

function sassNpmImporter(url, prev, done) {
  // Fall back to old URL
  var newUrl = url;

  try {
    if (cache[url]) {
      newUrl = cache[url];
      return;
    }

    if (url[0] === '.' || url.indexOf('/') !== -1) {
      return;
    }

    var module = path.join('node_modules', url);
    var modulePath = findup(module, {
      cwd: path.dirname(prev),
      nocase: true
    });

    var moduleJson = require(path.join(modulePath, 'package.json'));
    newUrl = path.join(modulePath, moduleJson.mainSass);
  } catch (e) {
  } finally {
    cache[url] = newUrl;
    done({ file: newUrl });
  }
}

module.exports = sassNpmImporter;
