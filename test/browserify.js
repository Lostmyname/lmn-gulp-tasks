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
      dest: out,
      minify: false
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
      dest: out,
      minify: false
    })();

    stream.on('finish', function () {
      var file = getFile(out);

      file.length.should.be.within(580, 680);
      file.toString().should.containEql('test');

      done();
    });
  });

  it('should object to ../node_modules', function (done) {
    loadLmnTask('browserify', {
      src: path.join(fixtures, 'bad-import.js'),
      minify: false,
      onError: function (err) {
        err.toString().should.containEql('contains "../node_modules"');
        done();
      }
    })();
  });

  it('should minify and strip console.log', function (done) {
    var out = path.join(fixturesOut, 'require.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'require.js'),
      dest: out
    })();

    stream.on('finish', function () {
      var file = getFile(out);

      file.length.should.be.within(530, 600);
      file.toString().should.not.containEql('\n');
      file.toString().should.not.containEql('console.log');

      done();
    });
  });

  it('should not minify when false', function (done) {
    var out = path.join(fixturesOut, 'require.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'require.js'),
      dest: out,
      minify: false
    })();

    stream.on('finish', function () {
      var file = getFile(out);

      file.length.should.be.within(580, 680);
      file.toString().should.containEql('\n');
      file.toString().should.containEql('console.log');

      done();
    });
  });
});
