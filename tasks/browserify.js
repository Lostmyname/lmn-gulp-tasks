'use strict';

var os = require('os');
var path = require('path');
var fs = require('fs');
var babelify = require('babelify');
var browserify = require('browserify');
var envify = require('envify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var through = require('through2');
var resolve = require('resolve');
var _ = require('lodash');
var watchify = require('watchify');
var rev = require('../lib/rev');
var imagePathify = require('../lib/image-path-transform');

module.exports = function (vinyl, plugins, options) {
  options = _.clone(options);

  var basename = path.basename(options.dest);
  var dirname = options.dest = path.dirname(options.dest);

  return function browserifyTask() {
    if (typeof options.minify !== 'boolean') {
      options.minify = process.env.MINIFY_ASSETS || false;
    }

    if (typeof options.sourcemaps !== 'boolean') {
      options.sourcemaps = process.env.SOURCEMAPS || true;
    }

    var ignore = options.ignoreSuckyAntipattern;

    var opts = {
      debug: options.sourcemaps,
      ignore: ['jquery']
    };

    if (options.watch) {
      opts = _.assign({}, watchify.args, opts);
    }

    var bundler = browserify(opts);

    if (options.watch) {
      bundler = watchify(bundler);
      bundler.on('update', bundle);
      bundler.on('log', function (msg) {
        console.log('Browserify:', msg);
      });
    }

    var babelPlugins = [
      require('babel-plugin-transform-es2015-template-literals'),
      require('babel-plugin-transform-es2015-literals'),
      require('babel-plugin-transform-es2015-function-name'),
      require('babel-plugin-transform-es2015-arrow-functions'),
      require('babel-plugin-transform-es2015-block-scoped-functions'),
      require('babel-plugin-transform-es2015-object-super'),
      require('babel-plugin-transform-es2015-shorthand-properties'),
      require('babel-plugin-transform-es2015-computed-properties'),
      require('babel-plugin-transform-es2015-for-of'),
      require('babel-plugin-transform-es2015-sticky-regex'),
      require('babel-plugin-transform-es2015-unicode-regex'),
      require('babel-plugin-check-es2015-constants'),
      require('babel-plugin-transform-es2015-spread'),
      require('babel-plugin-transform-es2015-parameters'),
      require('babel-plugin-transform-es2015-destructuring'),
      require('babel-plugin-transform-es2015-block-scoping'),
      require('babel-plugin-transform-es2015-typeof-symbol'),
      [require('babel-plugin-transform-es2015-modules-commonjs'), { loose: true }],
      [require('babel-plugin-transform-regenerator'), { async: false, asyncGenerators: false }],
      require('babel-plugin-transform-es3-member-expression-literals'),
      require('babel-plugin-transform-es3-property-literals')
    ];

    if (options.react && options.watch && options.hotModuleReloading) {
      babelPlugins.push(['react-transform', {
        transforms: [{
          transform: 'livereactload/babel-transform',
          imports: ['react']
        }]
      }]);

      bundler.plugin(require('livereactload'))
    }

    bundler.transform(babelify.configure({
      presets: options.react ? ['react'] : [],
      plugins: babelPlugins,
      ignore: /jquery\-browserify\.js/
    }));

    bundler.transform(envify);

    if (options.disableImagePath !== true) {
      if (!options.assetManifest) {
        try {
          var manifestPath = path.join(options.manifest || '', 'rev-manifest.json');
          var manifest = fs.readFileSync(manifestPath);
          options.assetManifest = JSON.parse(manifest.toString());
        } catch (e) {
          if (e.message.indexOf('ENOENT') === -1) {
            throw e;
          }

          options.assetManifest = {};
        }
      }

      if (!options.resolvePath) {
        options.resolvePath = function (filename, manifest) {
          return manifest[filename] || filename;
        };
      }

      bundler.transform(imagePathify(options));
    }

    // Add local jQuery only, if it exists
    if (options.jquery !== false) {
      try {
        var res = resolve.sync('jquery', { basedir: process.cwd() });
        var stream = fs.createReadStream(res);
        stream.file = 'jquery-browserify.js';
        bundler.require(stream, { expose: 'jquery' });
      } catch (e) {
        if (e.message.indexOf('Cannot find module') !== -1) {
          console.log('jQuery couldn\'t be loaded, but that\'s okay');
        } else {
          throw e;
        }
      }
    }

    bundler.add(options.src);

    if (options.extras && options.extras.length) {
      // factor-bundle isn't designed to do this, so the first file is junk
      var outputs = [path.join(os.tmpdir(), 'junk.js')];

      options.extras.forEach(function (extra) {
        bundler.add(extra.src);
        outputs.push(extra.dest);

        // factor-bundle errors if the directory doesn't exist
        var dir = path.dirname(extra.dest);
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
      });

      bundler.plugin('factor-bundle', { outputs: outputs });
    }

    function bundle() {
      console.log('Browserify: Bundling');

      return bundler.bundle()
        .on('error', options.onError)
        .pipe(source(basename))
        .pipe(plugins.plumber({ errorHandler: options.onError }))
        .pipe(buffer())
        .pipe(ignore ? through.obj() : plugins.contains('../node_modules'))
        .pipe(options.sourcemaps ? plugins.sourcemaps.init({ loadMaps: true }) : through.obj())

        // Sourcemaps start
        .pipe(options.minify ? plugins.uglify() : through.obj())
        .pipe(options.minify ? plugins.stripDebug() : through.obj())
        // Sourcemaps end

        .pipe(options.sourcemaps ? plugins.sourcemaps.write('./') : through.obj())
        .pipe(vinyl.dest(dirname))
        .pipe(rev(vinyl, plugins, options));
    }

    return bundle();
  };
};
