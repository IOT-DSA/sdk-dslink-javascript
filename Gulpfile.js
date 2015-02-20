var browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    uglify = require('gulp-uglify'),
    gulp = require('gulp'),
    run = require('run-sequence');

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
  return gulp.src('test/test.js', {
    read: false
  }).pipe(mocha({ reporter: 'spec' }));
});

gulp.task('coverage', function (cb) {
  gulp.src(['lib/**/*.js', 'index.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          reporters:['lcov', 'text-summary']
        })) // Creating the reports after tests runned
        .on('end', cb);
    });
});

gulp.task('test', function(cb) {
  run(
    'lint',
    'mocha',
    cb
  );
});

gulp.task('browser', function() {
  var bundler = browserify({
    entries: ['./index.js'],
    standalone: 'DS'
  });

  var bundle = function() {
    return bundler
      .bundle()
      .pipe(source('dslink.js'))
      .pipe(buffer())
      .pipe(uglify({
        mangle: false
      }))
      .pipe(gulp.dest('dist/'));
  };

  return bundle();
});
