# Gulp Tasks [![Build Status](https://travis-ci.org/Lostmyname/lmn-gulp-tasks.svg?branch=master)](https://travis-ci.org/Lostmyname/lmn-gulp-tasks)

A collection of generic configurable Gulp tasks used in various projects,
themes and components at Lost My Name. They'll work in your projects, too!

## Install

```
$ npm install --save-dev lmn-gulp-tasks
```

## Usage

To use:

```js
var gulp = require('gulp');
var getLmnTask = require('lmn-gulp-tasks');

gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js'
}));
```

You can read why we're taking this approach of splitting Gulp into multiple
files instead of the one detailed in the Gulp recipes in my article [here]
(http://macr.ae/article/splitting-gulpfile-multiple-files.html).

## Handling errors

Most of the tasks in this package have error handling built in so that Gulp
doesn't explode if you miss a semi-colon from your JS. By default, the errors
will be logged to the console and then ignored, but you can set your own
handlers, either by changing the default handler, or by setting a handler per
task.

### Changing the default handler

```js
var getLmnTask = require('lmn-gulp-tasks');

getLmnTask.setErrorHandler(function (err) {
  console.log('OH NO CRAZY BAD THINGS ARE HAPPENING');
});
```

### Changing the handler per task

```js
var gulp = require('gulp');
var getLmnTask = require('lmn-gulp-tasks');

gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js',
  onError: function (err) {
    console.log('The browserify task died!');
  }
}));
```

## Revisioning assets

A load of these tasks support revisioning of assets. There's an options called
`rev` which should be boolean:

```js
gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js',
  rev: true
}));
```

That'll create a fingerprinted version of the file, and write the path to a
manifest file. The location of the manifest file is by default the root
directory, but can be specified using the `manifest` options, which in turn
defaults to `process.env.MANIFEST_DEST`.

`rev` defaults to `process.env.NODE_ENV === 'production'`.

**Tasks that support revisioning are marked with asterisks.**


## Tasks

### browserify*

We use browserify on nearly all of our JavaScript at Lost My Name. This very
simple task just runs browserify on your input file:


```js
gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js',
  minify: false
}));
```

`minify` defaults to true: omitting the option will result in the resulting JS
being minified. In addition to minifying, the `minify` option will call
strip-debug, which strips `console`, `alert` and `debugger` statements.

This will remove multiple versions of jQuery and include the version from the
package in question. If you don't want jQuery, specify `jquery: false`. If you
want multiple versions of jQuery: you can't do that, weirdo.

There's also some react stuff built in: set `react` to true to enable the JSX
parser, and set `hotModuleReloading` to enable hot module reloading (note that
`watch` also needs to be true).

#### factor-bundle

Finally, we've added support for factor-bundle so that you can make other files
with the dependencies in the main bundle still. This is good for performance!
Configure it using the extras option.

```js
gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js',
  minify: false,
  extras: [
    { src: './src/js/monkey-extras.js', dest: './demo/build/bundle-extras.js' }
  ]
}));
```

You need to `require('./monkey')` from monkey-extras.js, but then when you load
bundle.js before bundle-extras.js and it will act as if they're in one file.

### clean

This task deletes stuff. `src` can be either a string or an array.

```js
gulp.task('clean', getLmnTask('clean', {
  src: 'deletethis.json'
}));
```

### copy*

Literally just copies stuff from one place to another, and can fingerprint it
if necessary.

Have the option to flatten the directory structure if needed.

```
gulp.task('move-favicon', loadLmnTask('copy', {
  src: './assets/favicon.ico',
  dest: './demo/build',
  rev: false,
  flatten: false
}));
```

### extract*

This task is used to extract assets (or anything else, for that matter) from
modules stored in a node_modules directory somewhere.

```js
gulp.task('getMarkdown', loadLmnTask('extract', {
  module: 'my-module',
  src: '/src/markdown/**/*.md',
  dest: 'markdown'
}));
```

That will extract everything matching that path inside the first module
matching `my-module`.

### html

Useful in LMN components only, probably. Takes faux-erb files and turns them
into HTML.

```js
gulp.task('html', getLmnTask('html', {
  langBase: 'component.monkey',
  imagePath: '../imgs',
  context: {
    foo: 'bar' // Will be accessible in the template files
  }
}));
```

### js-quality

This task runs ESLint on your JavaScript, and optionally stops Gulp if an
error is found.

```js
gulp.task('js-quality', getLmnTask('js-quality', {
  src: './src/js/**/*.js',
  dieOnError: true
}));
```

`dieOnError` defaults to false, so if you miss that option out, Gulp will not
die.

Prior to 2.0.0, lmn-gulp-task used JSHint, JSCS, and Buddy.js.

### optimise-svgs*

This task gets svgs, optionally flattens the directory structure, optimises
the svgs and makes optimised png fallbacks for browsers that don't support svg.

```js
gulp.task('optimise-svgs', loadLmnTask('optimise-svgs', {
  src: './src/images/**/*.svg',
  dest: buildPath + 'images',
  flatten: true // Defaults to false
}));
```

### responsive-images*

The responsive-images task is pretty big. It handles turning images like
some-image-500x50@2x.png into some-image-xlarge.png, some-image-large.png,
etc.

```js
gulp.task('responsive-images', loadLmnTask('responsive-images', {
  src: './src/images/**/*.{png,jpg,gif}',
  dest: buildPath + 'images',
  lossless: function (file) {
    return _.contains(file.path, 'hero');
  },
  flatten: true // defaults to false
}));
```

This is an option called `retinaSrc`, but you might not need to specify it:
the task will attempt to calculate it by replacing `*.{` with `*@2x*.{`: for
example, if your `src` is `./img/**/*.{png,jpg}`, your generated retinaSrc will
be `./img/**/*@2x*.{png,jpg}`.

The `lossless` option should be either a function or a boolean value, and is
used to tell whether to compress the image losslessly or not. It defaults to
false, and imagemin will use `jpegoptim({ max: 80 })`. It's a big reduction in
file size, and it's not noticeable unless you look hard. You can see in the
example code above that we compress everything but the header images using a
lossy compression.

There are also two options called `skipResize` and `skipOptimize` that you want
to set true only on the certain situation. For example, they would be useful when
you run integration tests on CI. It skips resizing but copies images with the
publishing names. Both are false in default.

### scss*

The scss tasks runs compass on one or more specified SCSS files, then runs
autoprefixer on the resulting CSS, then optionally minifies it.

```js
gulp.task('scss', getLmnTask('scss', {
  src: './src/scss/*.{sass,scss}',
  dest: './demo/build',
  includePaths: [],
  minify: false
}));
```

`minify` defaults to true: omitting the option will result in the resulting CSS
being minified.

The task, in addition to passing through any include paths you give it, will
pass in the output of [find-node-modules], making it easier to include SCSS
from modules from npm. Using ../node_modules is an anti-pattern, as explained
below! To disable this behaviour, set `includePaths` to `false`.

#### Checking for ../node_modules

The problem with writing "../node_modules" is that there is no guarantee that
the module will actually be installed there. It could have been installed a
directory up, in which case it won't be installed again below.

There should never be any need to write "../node_modules", as the import paths
are set for you. Therefore, it should be considered an antipattern, and this
task will throw an error if you write "../node_modules" anywhere in your Sass.

If you really want to use this anti-pattern, you can set the
`ignoreSuckyAntipattern` option to true and the task won't check your code.

### small-sprite

This task generates a sprite sheet from large images, shrinking them in the
process. Good for book previews and New Zealand tourist websites.

```js
gulp.task('a-z-images', getTask('small-sprite', {
  src: './src/components/garousel/images/*.jpg',
  imgDest: './src/components/garousel/azbook.jpg',
  cssDest: './src/components/garousel/_generated.scss'
}));
```

I'd recommend committing the generated image and scss, and not committing the
source images unless they're already in the repo—this task doesn't need
running unless the images change, and it takes a couple seconds to run, which
then needs combining with the scss task. You get the picture.

### test-locales

This searches for localised files and ensures that if a file is localised, it
is localised in every language:

```js
gulp.task('test-locales', getLmnTask('test-locales', {
  src: './src/images/**/*.{png,jpg,gif}',
  locales: ['en-US', 'de', 'en-GB']
}));
```


## License

This project is released under the MIT license.

[find-node-modules]: https://github.com/callumacrae/find-node-modules
[buddy.js]: https://github.com/danielstjules/buddy.js
