const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browerSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const del = require('del');
const webpackStream = require('webpack-stream');
// const webpackConfig = require('./webpack.config.js');
// const gcmq = require('gulp-group-css-media-queries');

// const style = () => {
//   return gulp.src('./scss/**/*.scss')
//     .pipe(sass())
//     .pipe(gulp.dest('./css'))
//     .pipe(browerSync.stream())
// }

// const watch = () => {
//   browerSync.init({
//     server: {
//       baseDir: './'
//     }
//   })
//   gulp.watch('./scss/**/*.scss', style);
//   gulp.watch('./*.html').on('change', browerSync.reload);
// }

// exports.style = style;
// exports.watch = watch;

const css = () => {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer({
      grid: true,
    })]))
    // .pipe(gcmq()) // выключите, если в проект импортятся шрифты через ссылку на внешний источник
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
};

const js = () => {
  return gulp.src(['source/js/main.js'])
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest('build/js'))
};

const svgo = () => {
  return gulp.src('source/img/**/*.{svg}')
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {removeRasterImages: true},
          {removeUselessStrokeAndFill: false},
        ]
      }),
    ]))
    .pipe(gulp.dest('source/img'));
};

const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite_auto.svg'))
    .pipe(gulp.dest('build/img'));
};

const copySvg = () => {
  return gulp.src('source/img/**/*.svg', {base: 'source'})
    .pipe(gulp.dest('build'));
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg,webp}', {base: 'source'})
    .pipe(gulp.dest('build'));
};

const copy = () => {
  return gulp.src([
    'source/**.html',
    'source/fonts/**',
    'source/img/**',
    'source/favicon/**',
  ], {
    base: 'source',
  })
    .pipe(gulp.dest('build'));
};

const clean = () => {
  return del('build');
};

const syncServer = () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/**.html', gulp.series(copy, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series(css));
  gulp.watch('source/js/**/*.{js,json}', gulp.series(js, refresh));
  gulp.watch('source/data/**/*.{js,json}', gulp.series(copy, refresh));
  gulp.watch('source/img/**/*.svg', gulp.series(copySvg, sprite, refresh));
  gulp.watch('source/img/**/*.{png,jpg,webp}', gulp.series(copyImages, refresh));

  gulp.watch('source/favicon/**', gulp.series(copy, refresh));
  gulp.watch('source/video/**', gulp.series(copy, refresh));
  gulp.watch('source/downloads/**', gulp.series(copy, refresh));
  gulp.watch('source/*.php', gulp.series(copy, refresh));
};

const refresh = (done) => {
  server.reload();
  done();
};

const build = gulp.series(clean, svgo, copy, css, sprite, js);

const start = gulp.series(build, syncServer);