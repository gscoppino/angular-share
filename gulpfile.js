(function () {
    var gulp = require('gulp');
    var connect = require('gulp-connect');

    gulp.task('build', function () {
        return gulp.src(['src/*.js'])
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('demo/vendor'));
    });

    gulp.task('build:watch', ['build'], function () {
        connect.server({
            root: 'demo',
            livereload: true
        });

        gulp.watch('src/*.js', ['build'])
            .on('change', function (event) {
                console.log('File' + event.path + ' was ' + event.type + '.');
                return gulp.src('src/*.js').pipe(connect.reload());
            });

        gulp.watch('demo/*', function (event) {
            console.log('File' + event.path + ' was ' + event.type + '.');
            return gulp.src('demo/*').pipe(connect.reload());
        });
    });

    gulp.task('default', ['build:watch']);
}());