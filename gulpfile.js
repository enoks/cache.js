var gulp = require('gulp'),
    beautify = require('gulp-beautify'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),

    source = ['cache.js'],
    destination = './dist';

gulp.task('js', function () {
    return gulp.src(source)
        // https://github.com/beautify-web/js-beautify#options
        .pipe(beautify({
            end_with_newline: true,
            max_preserve_newlines: 2,
            space_in_paren: true
        }))
        .pipe(gulp.dest(destination))

        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({output: {comments: /^!|@preserve|@license|@cc_on/i}}))
        .pipe(gulp.dest(destination));
});

gulp.task('default', gulp.series(function (done) {
    gulp.watch(source, gulp.series('js'));
    done();
}));
