/* global clean, getFile */

'use strict';

var loadLmnTask = require('../');
var path = require('path');
var should = require('should');
var _ = require('lodash');

var p = _.partial(path.join, './test/fixtures');

describe('optimise-svgs', function () {
  before(clean);
  after(clean);

  it('shouldnt optimise unchanged svgs', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: p('svg/logo-148x35.svg'),
      dest: p('svg')
    })();

    stream.on('finish', function () {
      should.throws(function () {
        getFile(p('svg/logo-148x35.png'));
      }, /ENOENT/);

      done();
    });
  });

  it('should optimise changed svgs', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: p('svg/logo-148x35.svg'),
      dest: p('out')
    })();

    stream.on('finish', function () {
      var expectedSvg = getFile(p('svg/logo-148x35-out.svg'));
      var svgOut = getFile(p('out/logo-148x35.svg'));

      svgOut.should.eql(expectedSvg);

      done();
    });
  });

  it('should rasterise optimised svgs', function () {
    var expectedPng = getFile(p('svg/logo-148x35-out.png'));
    var pngOut = getFile(p('out/logo-148x35.png'));

    pngOut.should.eql(expectedPng);
  });
});
