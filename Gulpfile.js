var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var gulp = require('gulp');

gulp.task('lint/lib', function() {
  return gulp.src('lib/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint/index', function() {
  return gulp.src('index.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint', ['lint/index', 'lint/lib'], function() {});

gulp.task('mocha', function() {
  return gulp.src('test/test.js', {read: false})
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test', ['mocha', 'lint'], function() {});
