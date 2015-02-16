'use strict';

var loadLmnTask = require('../');

var fs = require('fs');
var path = require('path');

var fixtures = path.join(__dirname, 'fixtures/sass');

function getFile(name, slice) {
  var buffer = fs.readFileSync(path.join(fixtures, name));

  if (slice !== false) {
    buffer = buffer.slice(0, -1);
  }

  return buffer;
}


describe('scss', function () {
  it('should parse simple scss', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.should.eql(getFile('test-out.min.css'));

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
  //      files[0].contents.should.eql(getFile('test-out.min.css'));
  //
  //      done();
  //    }
  //  })();
  //});

  it('should parse simple scss with minify false', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'test.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.should.eql(getFile('test-out.css', false));

        done();
      }
    })();
  });

  it('should handle node_modules imports', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'import.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.length.should.be.above(1000);

        done();
      }
    })();
  });

  it('should be autoprefixed', function (done) {
    loadLmnTask('scss', {
      src: path.join(fixtures, 'prefix.scss'),
      minify: false,
      dest: function (files) {
        files.length.should.equal(1);

        files[0].contents.toString('utf8').should.containEql('-ms');

        done();
      }
    })();
  });

  it('should check for "../node_modules"');
});
