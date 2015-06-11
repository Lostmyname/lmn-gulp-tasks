'use strict';

import loadLmnTask from '../index';

import path from 'path';
import should from 'should';
import hook from 'hook-stdio';

var fixtures = path.join(__dirname, 'fixtures/js');

describe('js-quality', function () {
  it('should not complain when there is nothing wrong', function (done) {
    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'simple.js'),
      onError: function () {
        throw new Error('This should not have errored!');
      }
    })();

    stream.resume();
    stream.on('end', function () {
      done();
    });
  });

  it('should die when JSCS error', function (done) {
    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-jscs.js'),
      onError: function (err) {
        var errString = err.toString();

        errString.should.containEql('Illegal space before');

        // Basically a way of counting the errors
        errString.split('bad-jscs.js').length.should.equal(8);
      }
    })();

    stream.resume();
    stream.on('end', function () {
      done();
    });
  });

  it('should die when JSHint error', function (done) {
    // jshint-stylish outputs to the console
    var output = '';
    var unhook = hook.stdout(function (string) {
      output += string;
    });

    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-jshint.js')
    })();

    stream.resume();
    stream.on('end', function () {
      unhook();

      output.should.containEql('\'unused\' is defined but never used.');

      done();
    });
  });

  it('should test for magic numbers', function (done) {
    // gulp-buddy.js outputs to the console
    var output = '';
    var unhook = hook.stdout(function (string) {
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

  it('should not test for magic numbers when told not to', function (done) {
    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-magic.js'),
      magicAllowed: true,
      onError: function () {
        throw new Error('This should not have errored!');
      }
    })();

    stream.resume();
    stream.on('end', function () {
      done();
    });
  });

  it('should allow specific magic numbers', function (done) {
    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-magic.js'),
      magicAllowed: [876345],
      onError: function () {
        throw new Error('This should not have errored!');
      }
    })();

    stream.resume();
    stream.on('end', function () {
      done();
    });
  });
});
