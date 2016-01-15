(function () {
    var gulp = require('gulp');
    var connect = require('gulp-connect');
    var eslint = require('gulp-eslint');
    var concat = require('gulp-concat');
    var angularTemplateCache = require('gulp-angular-templatecache');
    var merge = require('merge-stream');

    gulp.task('lint', function () {
        return gulp.src(['src/**/*.js'])
            .pipe(eslint())
            .pipe(eslint.format('stylish'));
    });

    gulp.task('build:angular', ['lint'], function () {

        var scripts = gulp.src(['src/**/*.js'])
            .pipe(concat('angular-share.js'));

        var templates = gulp.src(['src/**/*.html'])
            .pipe(angularTemplateCache('angular-share.js', {
                module: 'angular-share.templates',
                root: 'templates',
                standalone: true
            }));

        return merge(scripts, templates)
            .pipe(concat('angular-share.js'))
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('demo/vendor'));
    });

    gulp.task('build', ['build:angular']);

    gulp.task('build:watch', ['build'], function () {
        connect.server({
            root: 'demo',
            livereload: true
        });

        gulp.watch('src/**/*.js', ['build'])
            .on('change', function (event) {
                console.log('File' + event.path + ' was ' + event.type + '.');
                return gulp.src('src/**/*.js')
                    .pipe(eslint())
                    .pipe(eslint.format('stylish'))
                    .pipe(connect.reload());
            });

        gulp.watch('demo/*', function (event) {
            console.log('File' + event.path + ' was ' + event.type + '.');
            return gulp.src('demo/*').pipe(connect.reload());
        });
    });

    gulp.task('default', ['build:watch']);
}());