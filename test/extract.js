/* global getFile */

'use strict';

var loadLmnTask = require('../');

describe('extract', function () {
  it('should extract stuff. duh.', function (done) {
    loadLmnTask('extract', {
      module: 'gulp',
      src: 'bin/gulp.js',
      dest: function (files) {
        files.length.should.equal(1);

        var filePath = 'node_modules/gulp/bin/gulp.js';
        files[0].contents.should.eql(getFile(filePath, false));

        done();
      }
    })();
  });
});
