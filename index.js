'use strict';

var findup = require('findup-sync');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
  requireFn: function (name) {
    return require(__dirname + '/node_modules/' + name);
  }
});

function errorHandler(err) {
  plugins.util.log(err.toString());
}

module.exports = function getTask(name, options) {
  if (typeof options.onError !== 'function') {
    options.onError = errorHandler;
  }

  // This means that you don't have to call this.emit('end') yourself
  var actualErrorHandler = options.onError;
  options.onError = function () {
    actualErrorHandler.apply(this, arguments);
    this.emit('end');
  };

	return require('./tasks/' + name)(gulp, plugins, options);
};

module.exports.setErrorHandler = function (newHandler) {
  errorHandler = newHandler;
};
