'use strict';

import loadLmnTask from '../index';

import path from 'path';
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

  it('should die when ESLint syntax error (previously JSCS)', function (done) {
    var output = '';
    var unhook = hook.stdout(function (string) {
      output += string;
    });

    var stream = loadLmnTask('js-quality', {
      src: path.join(fixtures, 'bad-jscs.js')
    })();

    stream.resume();
    stream.on('end', function () {
      unhook();

      output.should.containEql('space-in-parens');

      // Basically a way of counting the errors
      output.split('error').length.should.equal(6);

      done();
    });
  });

  it('should die when ESLint error', function (done) {
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

      output.should.containEql('unused is defined but never used');

      done();
    });
  });
});
