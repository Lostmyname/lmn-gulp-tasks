# Gulp Tasks

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
doesn't explode if you miss a semi-colon from your JS. BY default, the errors
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


## Tasks

### auto-reload

When you run this task, it will watch the gulpfile for changes and restart
gulp when a change is made. In addition, there is an `addArgs` option which
will add an argument to the gulp call on every run that isn't the first one:
useful if you only want BrowserSync to open a browser on the first run, for
example.

```js
gulp.task('auto-reload', getLmnTask('auto-reload', {
  addArgs: ['--no-open']
}));
```

### browserify

We use browserify on nearly all of our JavaScript at Lost My Name. This very
simple task just runs browserify on your input file:


```js
gulp.task('js', getLmnTask('browserify', {
  src: './src/js/monkey.js',
  dest: './demo/build/bundle.js'
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

### scss

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


## License

This project is released under the MIT license.
