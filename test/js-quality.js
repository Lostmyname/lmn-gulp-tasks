/* global hookOnce, hookStdout */

'use strict';

var loadLmnTask = require('../');

var path = require('path');
var should = require('should');

var fixtures = path.join(__dirname, 'fixtures/js');

describe('js-quality', function () {
  it('should not complain when there is nothing wrong', function (done) {
    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'simple.js'),
      onError: function () {
        should.fail();
      }
    })();

    stream.on('finish', function () {
      done();
    });
  });

  it('should die when JSCS error', function (done) {
    loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-jscs.js'),
      onError: function (err) {
        var errString = err.toString();

        errString.should.containEql('Illegal space before');

        // Basically a way of counting the errors
        errString.split('bad-jscs.js').length.should.equal(8);

        done();
      }
    })();
  });

  it('should die when JSHint error', function (done) {
    // jshint-stylish outputs to the console
    hookOnce(function (string) {
      string.should.containEql('\'unused\' is defined but never used.');

      done();
    });

    loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-jshint.js')
    })();
  });

  it('should test for magic numbers', function (done) {
    // gulp-buddy.js outputs to the console
    var output = '';
    var unhook = hookStdout(function (string) {
      output += string;
    });

    loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-magic.js'),
      onError: function (err) {
        unhook();

        output.should.containEql('876345');
        err.toString().should.containEql('buddy.js failed');

        done();
      }
    })();
  });
});
