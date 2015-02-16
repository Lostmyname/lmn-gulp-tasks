# Gulp Tasks [![Build Status](https://travis-ci.org/Lostmyname/lmn-gulp-tasks.svg)](https://travis-ci.org/Lostmyname/lmn-gulp-tasks)

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
manifest file in the root directory.

`rev` defaults to `process.env.NODE_ENV === 'production'`.

**Tasks that support revisioning are marked with asterisks.**


## Tasks

### auto-reload

When you run this task, it will watch the gulpfile for changes and restart
Gulp when a change is made. In addition, there is an `addArgs` option which
will add an argument to the Gulp call on every run that isn't the first one:
useful if you only want BrowserSync to open a browser on the first run, for
example.

```js
gulp.task('auto-reload', getLmnTask('auto-reload', {
  addArgs: ['--no-open']
}));
```

### browserify*

We use browserify on nearly all of our JavaScript at Lost My Name. This very
simple task just runs browserify on your input file:


```js
gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js'
}));
```

### clean

This task deletes stuff. `src` can be either a string or an array.

```js
gulp.task('clean', getLmnTask('clean', {
  src: 'deletethis.json'
}));
```

### component-default

A default task suitable for Lost My Name components generated using
generator-lmn-component. Starts browser-sync, and watches some files.

```js
gulp.task('default', getLmnTask('component-default', {
  reloadFiles: [], // Array of files to give to browsersync
  watch: true // Run the watchers
}));
```

I wouldn't recommend changing the options, or even specifying any at all.
Usually this is fine:

```js
gulp.task('default', getLmnTask('component-default'));
```

### copy*

Literally just copies stuff from one place to another, and can fingerprint it
if necessary.

```
gulp.task('move-favicon', loadLmnTask('copy', {
  src: './assets/favicon.ico',
  dest: './demo/build',
  rev: false
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

This task runs JSCS and JSHint on your JavaScript, and optionally stops Gulp
if an error is found.

```js
gulp.task('js-quality', getLmnTask('js-quality', {
  src: './src/js/**/*.js',
  dieOnError: true
}));
```

`dieOnError` defaults to false, so if you miss that option out, Gulp will not
die.

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

### scss*

The scss tasks runs compass on one or more specified SCSS files, then runs
autoprefixer on the resulting CSS, then optionally minifies it.

```js
gulp.task('scss', getLmnTask('scss', {
  src: './src/scss/*.{sass,scss}',
  dest: './demo/build',
  minify: false
}));
```

`minify` defaults to true: omitting the option will result in the resulting CSS
being minified.

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
