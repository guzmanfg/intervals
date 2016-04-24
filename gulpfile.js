/*global require*/
(function() {
    'use strict';
    var gulp = require('gulp');
    var concat = require('gulp-concat');

    gulp.task('build', function() {
        return gulp.src(['./src/js/utils.js', './src/js/endpoint.js', './src/js/intervals.js'])
                   .pipe(concat('intervals.js'))
                   .pipe(gulp.dest('./dist/'));
    });

    gulp.task('default', ['build']);
}());
