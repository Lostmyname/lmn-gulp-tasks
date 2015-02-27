/* global clean, getFile */

'use strict';

var loadLmnTask = require('../');

var path = require('path');

var fixtures = path.join(__dirname, 'fixtures/js');
var fixturesOut = path.join(__dirname, 'fixtures/out');

describe('browserify', function () {
  beforeEach(clean);
  afterEach(clean);

  it('should parse simple js', function (done) {
    var out = path.join(fixturesOut, 'simple.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.js'),
      dest: out
    })();

    stream.on('finish', function () {
      var file = getFile(out);

      file.length.should.be.within(450, 550);
      file.toString().should.containEql('test');

      done();
    });
  });

  it('should handle requires', function (done) {
    var out = path.join(fixturesOut, 'require.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'require.js'),
      dest: out
    })();

    stream.on('finish', function () {
      var file = getFile(out);

      file.length.should.be.within(580, 680);
      file.toString().should.containEql('test');

      done();
    });
  });
});
