/* global clean, getFile */

'use strict';

import loadLmnTask from '../index';

import fs from 'fs';
import path from 'path';

var fixtures = path.join(__dirname, 'fixtures/js');
var fixturesOut = path.join(__dirname, 'fixtures/out');

describe('browserify', function () {
  beforeEach(clean);
  afterEach(clean);

  // For some reason this speeds up the first task
  before(() => loadLmnTask('browserify', {}));

  it('should parse simple js', function (done) {
    var out = path.join(fixturesOut, 'simple.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.js'),
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
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
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      file.length.should.be.within(580, 680);
      file.toString().should.containEql('test');

      done();
    });
  });

  it('should handle es6 imports', function (done) {
    var out = path.join(fixturesOut, 'import.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'import.js'),
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      file.length.should.be.within(770, 870);
      file.toString().should.containEql('test');

      done();
    });
  });

  it('should object to ../node_modules', function (done) {
    loadLmnTask('browserify', {
      src: path.join(fixtures, 'bad-import.js'),
      minify: false,
      sourcemaps: false,
      jquery: false,
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
      sourcemaps: false,
      jquery: false,
      dest: out,
      minify: true
    })();

    stream.resume();
    stream.on('end', function () {
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
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      file.length.should.be.within(580, 680);
      file.toString().should.containEql('\n');
      file.toString().should.containEql('console.log');

      done();
    });
  });

  it('should do source maps', function (done) {
    var out = path.join(fixturesOut, 'simple.js');
    var mapOut = path.join(fixturesOut, 'simple.js.map');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.js'),
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out, false);

      file.length.should.be.within(500, 600);
      file.toString().should.containEql('//# sourceMappingURL=simple.js.map');

      var map = getFile(mapOut, false);

      map.length.should.be.within(650, 800);

      var sources = {
        sources: [
          'node_modules/browserify/node_modules/browser-pack/_prelude.js',
          'test/fixtures/js/simple.js'
        ]
      };

      map.toString().should.containEql(JSON.stringify(sources).slice(1, -1));

      done();
    });
  });

  it('should magically add jquery', function (done) {
    var out = path.join(fixturesOut, 'simple.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.js'),
      sourcemaps: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      file.length.should.be.above(200000);
      file.toString().should.containEql('test');
      file.toString().should.containEql('noConflict = ');

      done();
    });
  });

  it('should stay quiet when no jquery available', function (done) {
    var jqueryPath = path.join(process.cwd(), 'node_modules/jquery');

    fs.rename(jqueryPath, jqueryPath + '1', function (err) {
      if (err) {
        done(err);
      }

      var out = path.join(fixturesOut, 'simple.js');
      var stream = loadLmnTask('browserify', {
        src: path.join(fixtures, 'simple.js'),
        sourcemaps: false,
        dest: out
      })();

      stream.resume();
      stream.on('end', function () {
        var file = getFile(out);

        file.length.should.be.within(450, 550);
        file.toString().should.containEql('test');
        file.toString().should.not.containEql('noConflict = ');

        fs.rename(jqueryPath + '1', jqueryPath, function (err) {
          if (err) {
            done(err);
          }

          done();
        });
      });
    });
  });

  it('should handle ~~ES2015~~', function (done) {
    var out = path.join(fixturesOut, 'simple.babel.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'simple.babel.js'),
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      file.length.should.be.within(550, 650);
      file.toString().should.containEql('\'click\', function () {');
      file.toString().should.not.containEql('=>');

      done();
    });
  });

  it('should not parse let or classes', function (done) {
    var out = path.join(fixturesOut, 'bad-es6.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'bad-es6.js'),
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      var contents = file.toString();

      contents.should.containEql('class Test {');
      contents.should.not.containEql('function Test()');

      contents.should.containEql('let hello');
      contents.should.not.containEql('var hello');

      done();
    });
  });
});
