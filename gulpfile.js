//for gulp 3: npm i -D pump run-sequence

var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var images = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
/*var run = require('run-sequence');*/ // for gulp 3
var del = require('del');
var uglify = require('gulp-uglify');
var pump = require('pump');


gulp.task('style', function () {
  return gulp.src('less/style.less') // *return* for gulp 4
    .pipe(plumber())
    .pipe(less())
    .pipe(
      postcss([
        require('css-mqpacker')({sort: true}),
        require('autoprefixer')()
      ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('js', function (cb) {
  pump([
        gulp.src('js/script.js'),
        gulp.dest('build/js'),
        uglify(),
        rename('script.min.js'),
        gulp.dest('build/js'),
        server.stream()
    ],
    cb
  );
});

gulp.task('images', function () {
  return gulp.src('img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagenin.svgo()
    ]))
    .pipe(gulp.dest('img'));
});

gulp.task('webp', function () {
  return gulp.src('img/**/*.{png,jpg,svg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('img'));
});

gulp.task('sprite', function () {
  return gulp.src('img/**/*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('html', function () {
  return gulp.src('*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

gulp.task('clean', function () {
  return del('build')
})

gulp.task('copy', function () {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'img/**',
  ], {
    base: '.'
  })
  .pipe(gulp.dest('build'));
});

//gulp 3 serve
//gulp.task('serve', function () {
//  server.init({
//    server: {
//      baseDir: 'build/'
//    }
//  });
//
//  gulp.watch('less/**/*.less', ['style']);
//  gulp.watch('*.html', ['html']);
//  gulp.watch('js/**/*.js', ['js']);
//});

//gulp 4 serve
gulp.task('serve', gulp.series(function () {
  server.init({
    server: {
      baseDir: 'build/'
    }
  });

  gulp.watch('less/**/*.less', gulp.series('style'));
  gulp.watch('*.html', gulp.series('html'));
  gulp.watch('js/**/*.js', gulp.series('js'));
}));

//gulp 3 build
//gulp.task('build', function (callback) {
//  run(
//    'clean',
//    'copy',
//    'style',
//    'js'
//    'sprite',
//    'html',
//    callback
//  );
//});

//gulp 4 build
gulp.task('build', gulp.series(
  'clean',
  'copy',
  gulp.parallel(
    'style',
    'js',
    'sprite',
    'html'
  )
));
