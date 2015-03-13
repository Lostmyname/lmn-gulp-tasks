/* global getFile */

'use strict';

var loadLmnTask = require('../');

var path = require('path');
var _ = require('lodash');

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

        files[0].contents.length.should.be.above(1000);

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

        files[0].contents.length.should.be.above(1000);

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
        files.length.should.equal(0);
      },
      onError: function (err) {
        err.message.should.containEql('file to import not found or unreadable');
        doneOnce();
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

        files[0].contents.toString().should.containEql('"sources":["test.scss"]');
        files[1].contents.should.eql(getFile(p('test-out.min-with-src.css')));

        done();
      }
    })();
  });
});
