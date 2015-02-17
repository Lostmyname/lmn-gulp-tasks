'use strict';

var gulp = require('gulp');
var getLmnTask = require('../');
var vfsFake = require('vinyl-fs-fake');

gulp.src = vfsFake.src;
gulp.dest = vfsFake.dest;

// Throw them for should.js
getLmnTask.setErrorHandler(function (err) {
  throw err;
});
