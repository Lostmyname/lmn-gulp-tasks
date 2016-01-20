/* global getFile */

'use strict';

import loadLmnTask from '../index';

import path from 'path';
import should from 'should';
import _ from 'lodash';

var fixtures = path.join(__dirname, 'fixtures/js/**');
var fixturesOut = path.join(__dirname, 'fixtures/out');

var f = _.partial(path.join, fixturesOut);

// For convenience, we're testing both the copy and clean tasks in this file

describe('copy and clean', function () {
  it('should copy files', function (done) {
    var stream = loadLmnTask('copy', {
      src: fixtures,
      dest: fixturesOut
    })();

    stream.resume();
    stream.on('finish', function () {
      var file = getFile(f('simple.js'));

      file.length.should.equal(24);
      file.toString().should.containEql('test');

      done();
    });
  });

  it('should clean files', function (done) {
    loadLmnTask('clean', {
      src: f('simple.js')
    })(function (err, files) {
      should(err).equal(null);

      files.length.should.equal(1);

      should.throws(function () {
        getFile(f('simple.js'));
      }, /ENOENT/);

      done();
    });
  });

  it('should clean arrays of files', function (done) {
    loadLmnTask('clean', {
      src: [f('bad-jscs.js'), f('bad-jshint.js'), f('require.js')]
    })(function (err, files) {
      should(err).equal(null);

      files.length.should.equal(3);

      should.throws(function () {
        getFile(f('bad-jscs.js'));
      }, /ENOENT/);

      should.throws(function () {
        getFile(f('bad-jshint.js'));
      }, /ENOENT/);

      done();
    });
  });
});
