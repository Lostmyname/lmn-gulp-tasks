/* global clean, getFile */

'use strict';

import loadLmnTask from '../index';

import fs from 'fs';
import path from 'path';
import should from 'should';

var fixtures = path.join(__dirname, 'fixtures/js');
var fixturesOut = path.join(__dirname, 'fixtures/out');

describe('browserify', function () {
  beforeEach(clean);
  afterEach(clean);

  this.timeout(10000);

  // For some reason this speeds up the first task
  before(function () {
    loadLmnTask('browserify', {});
  });

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

  it('should not parse classes', function (done) {
    var out = path.join(fixturesOut, 'bad-es6.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'bad-es6.js'),
      sourcemaps: false,
      jquery: false,
      disableImagePath: true,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      var contents = file.toString();

      contents.should.containEql('class Test {');
      contents.should.not.containEql('function Test()');

      done();
    });
  });

  it('should get environmental variables', function (done) {
    process.env.TESTING_STRING = 'blablabla1234';

    var out = path.join(fixturesOut, 'env.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'env.js'),
      sourcemaps: false,
      jquery: false,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      file.length.should.be.within(450, 550);
      file.toString().should.containEql('console.log("blablabla1234");');

      done();
    });
  });

  it('should support react and jsx', function (done) {
    this.timeout(8000);

    var out = path.join(fixturesOut, 'bad-es6.js');
    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'react.js'),
      sourcemaps: false,
      jquery: false,
      react: true,
      dest: out
    })();

    stream.resume();
    stream.on('end', function () {
      var file = getFile(out);

      var contents = file.toString();

      contents.should.match(/'div',\s+null,\s+'Teststring123'/);
      contents.should.not.containEql('<div>Teststring123</div>');

      contents.length.should.be.within(600000, 700000);

      done();
    });
  });

  it('should only allow stage 4 proposals', function (done) {
    loadLmnTask('browserify', {
      src: path.join(fixtures, 'bad-es7.js'),
      sourcemaps: false,
      jquery: false,
      dest: function () {
        should.throw('Should have failed');
      },
      onError: function (err) {
        err.message.should.containEql('Unexpected token');
        done();
      }
    })();
  });

  it('should split stuff out into other files if required', function (done) {
    var out = path.join(fixturesOut, 'main-bundle.js');
    var outOther = path.join(fixturesOut, 'checkout-bundle.js');
    var outRandom = path.join(fixturesOut, 'random-bundle.js');

    var stream = loadLmnTask('browserify', {
      src: path.join(fixtures, 'factor-bundle/bundle.js'),
      sourcemaps: false,
      jquery: false,
      dest: out,
      extras: [
        {
          src: path.join(fixtures, 'factor-bundle/bundle-checkout.js'),
          dest: outOther
        },
        {
          src: path.join(fixtures, 'factor-bundle/bundle-random.js'),
          dest: outRandom
        }
      ]
    })();

    stream.resume();
    stream.on('end', function () {
      var mainFile = getFile(out).toString();
      var checkoutFile = getFile(outOther).toString();
      var randomFile = getFile(outRandom).toString();

      mainFile.should.containEql('lib on all pages!');
      mainFile.should.containEql('console.log(lib);');
      mainFile.should.not.containEql('checkout');
      mainFile.should.not.containEql('random');

      checkoutFile.should.containEql('checkout');
      checkoutFile.should.not.containEql('lib on all pages!');
      checkoutFile.should.not.containEql('random');

      randomFile.should.containEql('random');
      randomFile.should.not.containEql('lib on all pages!');
      randomFile.should.not.containEql('checkout');

      done();
    });
  });

  describe('imagePath()', function () {
    // This horrible hack is to stop is being deleted straight away!
    beforeEach(function (done) {
      fs.writeFile('rev-manifest.json', '{"cat.jpg":"cat-123.jpg"}', function (err) {
        done(err);
      });
    });

    it('should revision paths wrapped by imagePath()', function (done) {
      var out = path.join(fixturesOut, 'image-path.js');
      var stream = loadLmnTask('browserify', {
        src: path.join(fixtures, 'image-path.js'),
        sourcemaps: false,
        jquery: false,
        dest: out
      })();

      stream.resume();
      stream.on('end', function () {
        var file = getFile(out);

        file.toString().should.containEql('var path = \'cat-123.jpg\';');
        file.toString().should.containEql('var badPath = \'404.jpg\';');

        done();
      });
    });

    it('should revision paths wrapped by imagePath() with custom manifest', function (done) {
      var out = path.join(fixturesOut, 'image-path.js');
      var stream = loadLmnTask('browserify', {
        src: path.join(fixtures, 'image-path.js'),
        sourcemaps: false,
        jquery: false,
        assetManifest: { 'cat.jpg': 'dog.jpg' },
        dest: out
      })();

      stream.resume();
      stream.on('end', function () {
        var file = getFile(out);

        file.toString().should.containEql('var path = \'dog.jpg\';');
        file.toString().should.containEql('var badPath = \'404.jpg\';');

        done();
      });
    });

    it('should support custom functions', function (done) {
      var out = path.join(fixturesOut, 'image-path.js');
      var stream = loadLmnTask('browserify', {
        src: path.join(fixtures, 'image-path.js'),
        sourcemaps: false,
        jquery: false,
        resolvePath: function (filename, manifest) {
          return '/a/b/c/' + (manifest[filename] || filename);
        },
        dest: out
      })();

      stream.resume();
      stream.on('end', function () {
        var file = getFile(out);

        file.toString().should.containEql('var path = \'/a/b/c/cat-123.jpg\';');
        file.toString().should.containEql('var badPath = \'/a/b/c/404.jpg\';');

        done();
      });
    });
  });

  describe('imageManifest()', function () {
    // This horrible hack is to stop is being deleted straight away!
    beforeEach(function (done) {
      /* eslint-disable max-len */
      fs.writeFile('rev-manifest.json', '{"cat-small.jpg":"cat-small-123.jpg", "cat-medium.jpg":"cat-medium-123.jpg", "cat-large.jpg":"cat-large-123.jpg", "cat-xlarge.jpg":"cat-xlarge-123.jpg"}', function (err) {
        done(err);
      });
      /* eslint-enable max-len */
    });

    it('should return a valid manifest', function (done) {
      var out = path.join(fixturesOut, 'image-manifest.js');
      var stream = loadLmnTask('browserify', {
        src: path.join(fixtures, 'image-manifest.js'),
        sourcemaps: false,
        jquery: false,
        dest: out
      })();

      stream.resume();
      stream.on('end', function () {
        var file = getFile(out);
        /* eslint-disable max-len */
        file.toString().should.containEql('var manifest = {"cat-small.jpg":"cat-small-123.jpg", cat-medium.jpg":"cat-medium-123.jpg", cat-large.jpg":"cat-large-123.jpg", cat-xlarge.jpg":"cat-xlarge-123.jpg"};');
        /* eslint-enable max-len */
        file.toString().should.containEql('var badManifest = {};');

        done();
      });
    });
  });
});
