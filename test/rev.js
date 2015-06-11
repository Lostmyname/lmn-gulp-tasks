/* global clean */

'use strict';

import loadLmnTask from '../index';

import fs from 'fs';
import path from 'path';
import _ from 'lodash';

var fixtures = path.join(__dirname, 'fixtures/js');
var fixturesOut = path.join(__dirname, 'fixtures/out');

describe('rev', function () {
  beforeEach(clean);
  afterEach(clean);

  it('should support revisioning', function (done) {
    var out = path.join(fixturesOut, 'simple.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.js'),
      sourcemaps: false,
      jquery: false,
      rev: true,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      fs.readdir(fixturesOut, function (err, files) {
        if (err) {
          done(err);
        }

        files.length.should.equal(2);

        var manifest = require('../rev-manifest.json');

        // Should contain both versioned and unversioned files
        files.should.containEql(_.keys(manifest)[0]);
        files.should.containEql(_.values(manifest)[0]);

        done();
      });
    });
  });

  it('should support outputting the manifest elsewhere', function (done) {
    var out = path.join(fixturesOut, 'simple.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.js'),
      sourcemaps: false,
      jquery: false,
      rev: true,
      manifest: path.join(fixturesOut, 'manifest'),
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      fs.readdir(fixturesOut, function (err, files) {
        if (err) {
          done(err);
        }

        files.length.should.equal(3);

        var manifest = require(path.join(fixturesOut, 'manifest/rev-manifest.json'));

        // Should contain both versioned and unversioned files
        files.should.containEql(_.keys(manifest)[0]);
        files.should.containEql(_.values(manifest)[0]);

        done();
      });
    });
  });
});
