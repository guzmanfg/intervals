/*global require*/
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('js', function(){
    browserify('.')
        .bundle()
        .on('error',  gutil.log)
        .pipe(source('intervals.js'))
        .pipe(gulp.dest('/dist'));
})