/* global clean, getFile */

'use strict';

var loadLmnTask = require('../');
var fs = require('fs');
var path = require('path');
var should = require('should');
var _ = require('lodash');

var p = _.partial(path.join, './test/fixtures');

describe('optimise-svgs', function () {
  beforeEach(clean);
  after(clean);

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
      var svgOut = getFile(p('out/logo-148x35.svg'), false);

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
      var svgOut = getFile(p('out/logo-148x35.svg'), false);

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
