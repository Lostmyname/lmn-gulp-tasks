/* global getFile */

'use strict';

import loadLmnTask from '../index';

import path from 'path';
import _ from 'lodash';

var fixtures = path.join(__dirname, 'fixtures/sass');
var p = _.partial(path.join, fixtures);

describe('scss', function () {
  it('should parse simple scss', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      minify: true,
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.should.eql(getFile(p('test-out.min.css')));

        done();
      }
    })();
  });

  it('should parse simple sass'); // gulp-sass is broken

  //it('should parse simple sass', function (done) {
  //  loadLmnTask('scss', {
  //    src: path.join(fixtures, 'test.sass'),
  //    dest: function (files) {
  //      files.length.should.equal(1);
  //
  //      files[0].contents.should.eql(getFile(p('test-out.min.css')));
  //
  //      done();
  //    }
  //  })();
  //});

  it('should parse simple scss with minify false', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      minify: false,
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.should.eql(getFile(p('test-out.css'), false));

        done();
      }
    })();
  });

  it('should handle node_modules imports', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.length.should.be.above(10);

        done();
      }
    })();
  });

  it('should handle other import paths', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import2.scss'),
      includePaths: ['test/fixtures'],
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        done();
      }
    })();
  });

  it('should handle node_modules imports even when other import paths', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      includePaths: ['something'],
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.length.should.be.above(10);

        done();
      }
    })();
  });

  it('should not handle node_modules imports when told not to', function (done) {
    var doneOnce = _.once(done);
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      includePaths: false,
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        done();
      },
      onError: function (err) {
        console.log(err)
        err.message.should.containEql('File to import not found or unreadable');
        doneOnce();
      }
    })();
  });

  it('should handle image-path', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'image-path.scss'),
      imagePath: '/what/ever',
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        var contents = files[0].contents.toString('utf8');

        contents.should.not.containEql('image-url');
        contents.should.containEql('/what/ever/man.jpg');

        done();
      }
    })();
  });

  it('should be autoprefixed', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'prefix.scss'),
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.toString('utf8').should.containEql('-ms');

        done();
      }
    })();
  });

  it('should check for "../node_modules"', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'bad-import.scss'),
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(0);
      },
      onError: function () {
        done();
      }
    })();
  });

  it('…unless you skip it', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'bad-import.scss'),
      ignoreSuckyAntipattern: true,
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);
        done();
      }
    })();
  });

  it('should do source maps', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      minify: true,
      dest: function (files) {
        files.length.should.equal(2);

        files[0].contents.toString().should.containEql('"sources":[');
        files[1].contents.should.eql(getFile(p('test-out.min-with-src.css'), false));

        done();
      }
    })();
  });

  it('should find paths in package.jsons', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import-npm.scss'),
      sourcemaps: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.length.should.be.above(10);

        done();
      }
    })();
  });

  it('should fingerprint images', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'fingerprint.scss'),
      rev: true,
      manifest: fixtures,
      dest: function (files) {
        files.length.should.equal(2);

        files[1].contents.toString().should.containEql('image-blabla.jpg');

        done();
      }
    })();
  });

  it('should not destroy remote images', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'issue-14.scss'),
      minify: false,
      sourcemaps: false,
      imagePath: 'http://localhost',
      dest: function (files) {
        files.length.should.equal(1);

        var contents = files[0].contents.toString();
        contents.should.containEql('url("http://localhost/test.png");');

        done();
      }
    })();
  });
});
