(function () {
    var gulp = require('gulp');
    var connect = require('gulp-connect');

    gulp.task('build', function () {
        return gulp.src(['src/*.js'])
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('demo/vendor'))
            .pipe(connect.reload());
    });

    gulp.task('serve', ['build'], function () {
        connect.server({
            root: 'demo',
            livereload: true
        });
    });

    gulp.task('default', ['build', 'serve']);
}());