/* global getFile */

'use strict';

import loadLmnTask from '../index';

import path from 'path';
import _ from 'lodash';

var fixtures = path.join(__dirname, 'fixtures/imgs');
var f = _.partial(path.join, __dirname, 'fixtures/out');

describe('small sprite', function () {
  this.timeout(5000);

  it('should generate spritesheet', function (done) {
    loadLmnTask('small-sprite', {
      src: path.join(fixtures, 'a-z-*.jpg'),
      imgDest: f('sprite.jpg'),
      cssDest: f('sprite.css')
    })(function (err) {
      if (err) {
        throw err;
      }

      var imgOut = getFile(f('sprite.jpg'));
      imgOut.length.should.be.within(23000, 23500);

      var cssOut = getFile(f('sprite.css'));
      var expectedCssOut = getFile(path.join(fixtures, 'sprite-out.css'));
      cssOut.should.deepEqual(expectedCssOut);

      done();
    });
  });
});
