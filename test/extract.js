/* global getFile */

'use strict';

import loadLmnTask from '../index';
import should from 'should';

describe('extract', function () {
  it('should extract stuff. duh.', function (done) {
    loadLmnTask('extract', {
      module: 'babel',
      src: 'index.js',
      dest: function (files) {
        files.length.should.equal(1);

        var filePath = 'node_modules/babel/index.js';
        files[0].contents.should.eql(getFile(filePath, false));

        done();
      }
    })();
  });

  it('should have a proper error when module not found', function () {
    loadLmnTask('extract', {
      module: 'gulp',
      src: 'bin/gulp.js',
      dest: function () {
        should.fail('This should have errored');
      }
    }).should.throw(/Module gulp not found/);
  });
});
