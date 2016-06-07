/* global clean, getFile */

'use strict';

import loadLmnTask from '../index';
import fs from 'fs';
import path from 'path';
import should from 'should';
import _ from 'lodash';

var p = _.partial(path.join, './test/fixtures');

describe('optimise-svgs', function () {
  beforeEach(clean);
  after(clean);

  this.timeout(4000);

  it('shouldnt optimise unchanged svgs', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: p('svg/logo-148x35.svg'),
      dest: p('svg')
    })();

    stream.resume();

    stream.on('end', function () {
      should.throws(function () {
        getFile(p('svg/logo-148x35.png'));
      }, /ENOENT/);
      done();
    });
  });

  it('should optimise and rasterise changed svgs', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: p('svg/logo-148x35.svg'),
      dest: p('out')
    })();

    stream.resume();

    stream.on('end', function () {
      var expectedSvg = getFile(p('svg/logo-148x35-out.svg'));
      var svgOut = getFile(p('out/logo-148x35.svg'));

      svgOut.should.eql(expectedSvg);

      var expectedPng = getFile(p('svg/logo-148x35-out.png'));
      var pngOut = getFile(p('out/logo-148x35.png'));

      pngOut.should.eql(expectedPng);
      done();
    });
  });

  it('should rev svgs and png correctly', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: p('svg/logo-148x35.svg'),
      dest: p('out'),
      rev: true
    })();

    stream.resume();

    stream.on('end', function () {
      var expectedSvg = getFile(p('svg/logo-148x35-out.svg'));
      var svgOut = getFile(p('out/logo-148x35.svg'));

      svgOut.should.eql(expectedSvg);

      var expectedPng = getFile(p('svg/logo-148x35-out.png'));
      var pngOut = getFile(p('out/logo-148x35.png'));

      pngOut.should.eql(expectedPng);

      fs.readdir(p('out'), function (err, files) {
        should(err).equal(null);
        files.length.should.equal(4);
        done();
      });
    });
  });
});
