'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var prettify = require('gulp-jsbeautifier');

var myFiles = ['./app/js/**/*.js', '!./app/js/bower_components/**/*.js'];

gulp.task('default', function() {
  // place code for your default task here
  console.log('hello gulp!');
});

gulp.task('lint', function() {
  gulp.src(myFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('format-js', function() {
  gulp.src(myFiles)
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest(function(data) {
      return data.base;
    }));
});

gulp.task('watch', function() {
  gulp.watch(myFiles, ['lint']);
});