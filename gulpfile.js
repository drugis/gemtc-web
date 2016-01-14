var gulp = require('gulp');
var jshint = require("gulp-jshint");

var myFiles = ['./app/js/**/*.js', '!./app/js/bower_components/**/*.js'];

gulp.task('default', function() {
  // place code for your default task here
  console.log('hello gulp!');
});

gulp.task("lint", function() {
    gulp.src(myFiles)
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task('watch', function() {
    gulp.watch(myFiles, ["lint"]);
});