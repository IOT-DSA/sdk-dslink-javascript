var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var gulp = require('gulp');
var runSequence = require('run-sequence')

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

gulp.task('coverage', function (cb) {
  gulp.src(['lib/**/*.js', 'index.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({reporters:['lcov', 'text-summary']})) // Creating the reports after tests runned
        .on('end', cb);
    });
});

gulp.task('test', function(cb) {
  runSequence(
    'lint',
    'mocha',
    cb
  )
});
