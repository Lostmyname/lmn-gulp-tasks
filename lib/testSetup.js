'use strict';

var fs = require('fs');
var del = require('del');
var vinyl = require('./vinyl');
var getLmnTask = require('../');
var vfsFake = require('vinyl-fs-fake');

vinyl.src = vfsFake.src;
vinyl.dest = vfsFake.dest;

// Throw them for should.js
getLmnTask.setErrorHandler(function (err) {
  throw err;
});

global.getFile = function getFile(name, slice) {
  var buffer = fs.readFileSync(name);

  if (slice !== false) {
    buffer = buffer.slice(0, -1);
  }

  return buffer;
};

global.clean = function clean() {
  return del(['test/fixtures/out', 'rev-manifest.json']);
};
