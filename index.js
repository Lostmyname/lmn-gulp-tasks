'use strict';

// Set up environmental vars from .env
require('dotenv').load({ silent: true });

var browserSync = require('browser-sync');
var vinyl = require('vinyl-fs');
var plugins = require('gulp-load-plugins')();

// Default error handler. Sends to browser-sync, and logs to console.
var errorHandler = function (err) {
  browserSync.notify(err.message, 3000);
  plugins.util.log(err.toString());

  if (process.argv.indexOf('--fail') !== -1) {
    throw new Error('Failed');
  }
};

/**
 * Get a task. This function just gets a task from the tasks directory, and
 * sets some sane default options used on all tasks such as the error handler
 * and the `rev` option.
 *
 * @param {string} name The name of the task.
 * @param {object} [options] Options to pass to the task.
 * @returns {function} The task!
 */
module.exports = function getTask(name, options) {
  if (typeof options !== 'object') {
    options = {};
  }

  if (typeof options.onError !== 'function') {
    options.onError = errorHandler;
  }

  if (typeof options.rev !== 'boolean') {
    options.rev = (process.env.NODE_ENV === 'production');
  }

  if (typeof options.manifest !== 'string') {
    options.manifest = process.env.MANIFEST_DEST;
  }

  // This means that you don't have to call this.emit('end') yourself
  var actualErrorHandler = options.onError;
  options.onError = function () {
    actualErrorHandler.apply(this, arguments);
    this.emit('end');
  };

  return require('./tasks/' + name)(vinyl, plugins, options);
};

/**
 * Set default error handler.
 *
 * @param newHandler
 */
module.exports.setErrorHandler = function (newHandler) {
  errorHandler = newHandler;
};
