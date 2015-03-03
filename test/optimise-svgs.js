/* global clean, getFile */

'use strict';

var loadLmnTask = require('../');
var should = require('should');

describe('optimise-svgs', function () {
  before(clean);
  after(clean);

  it('shouldnt optimise unchanged svgs', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: './test/fixtures/svg/logo-148x35.svg',
      dest: './test/fixtures/svg'
    })();

    stream.on('finish', function () {
      should.throws(function () {
        getFile('./test/fixtures/svg/logo-148x35.png');
      }, /ENOENT/);

      done();
    });
  });

  it('should optimise changed svgs', function (done) {
    var stream = loadLmnTask('optimise-svgs', {
      src: './test/fixtures/svg/logo-148x35.svg',
      dest: './test/fixtures/out'
    })();

    stream.on('finish', function () {
      var expectedSvg = getFile('./test/fixtures/svg/logo-148x35-out.svg');
      var svgOut = getFile('./test/fixtures/out/logo-148x35.svg');

      svgOut.should.eql(expectedSvg);

      done();
    });
  });

  it('should rasterise optimised svgs', function () {
    var expectedPng = getFile('./test/fixtures/svg/logo-148x35-out.png');
    var pngOut = getFile('./test/fixtures/out/logo-148x35.png');

    pngOut.should.eql(expectedPng);
  });
});
