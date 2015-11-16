'use strict';

var os = require('os');
var path = require('path');
var through = require('through2');
var gm = require('gm').subClass({ imageMagick: true });
var jpegoptim = require('imagemin-jpegoptim');
var merge = require('merge-stream');

module.exports = function (vinyl, plugins, options) {
  var cssBasename = path.basename(options.cssDest);
  var cssDirname = path.dirname(options.cssDest);
  var imgBasename = path.basename(options.imgDest);
  var imgDirname = path.dirname(options.imgDest);

  var percent = options.percent || 20;

  return function smallSpriteTask(done) {
    var stream = vinyl.src(options.src)
      .pipe(through.obj(function (file, enc, cb) {
        gm(file.contents, file.path)
          .resize(percent, percent, '%')
          .toBuffer(function (err, buffer) {
            if (err) {
              return cb(err);
            }

            file.contents = buffer;
            cb(null, file);
          });
      }))
      .pipe(vinyl.dest(path.join(os.tmpdir(), 'small-sprite')))
      .on('end', function () {
        // gulp.spritesmith doesn't get file contents from the stream
        var spriteStream = vinyl.src(path.join(os.tmpdir(), 'small-sprite/*.jpg'))
          .pipe(plugins.spritesmith({
            imgName: imgBasename,
            cssName: cssBasename,
            algorithm: 'top-down',
            cssTemplate: options.cssTemplate
          }));

        var imgStream = spriteStream.img
          .pipe(jpegoptim({ progressive: true })())
          .pipe(vinyl.dest(imgDirname));

        var cssStream = spriteStream.css
          .pipe(vinyl.dest(cssDirname));

        merge(imgStream, cssStream)
          .on('end', function () {
            done();
          })
          .on('error', function (err) {
            throw err;
          })
          .resume();
      });

    stream.resume();
    return stream;
  };
};
