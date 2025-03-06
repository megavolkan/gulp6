const { src, dest, watch, series, parallel } = require('gulp');

const cssnano = require('cssnano')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const plumber = require('gulp-plumber')
const concat = require('gulp-concat')
const terser = require('gulp-terser')
const fileinclude = require('gulp-file-include')
const rename = require('gulp-rename')
const browserSync = require('browser-sync').create()


// File Includes
function fileincludeTask() {
  return src(['src/views/**/*.html', '!src/views/**/_*.html'])
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest('dist'))
}

// Scss Task w/o Reload
function scssTask() {
  return src(['src/scss/**/*.scss', '!src/scss/vendor/bootstrap_source/**/*.*'], { sourcemaps: true })
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    .pipe(dest('dist/assets/css', { sourcemaps: '.' }))
    .pipe(browserSync.stream()) // Sayfayı reload etmeden css inject
}

// Scss Task w/o Reload
function bsScssTask() {
  return src(['src/scss/**/*.scss', '!src/scss/vendor/bootstrap_source/**/*.*'], { sourcemaps: true })
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    .pipe(dest('dist/assets/css', { sourcemaps: '.' }))
}

// Javascript Task
function jsTask() {
  return src([
    // Birleştirilecek JS dosyaları
    'src/scripts/_bootstrap.bundle.js',
    'src/scripts/_navigation.js',
    'src/scripts/_swiper.js',
    // 'src/scripts/_telinput.js',
    // 'src/scripts/_fancybox.umd.js',
    // 'src/scripts/_fslightbox.js',
    'src/scripts/_custom.js'
  ], { sourcemaps: true })
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(concat('script.js'))
    .pipe(terser())
    .pipe(dest('dist/assets/js', { sourcemaps: '.' }))
}

// Browsersync Tasks
function browsersyncServe(done) {
  browserSync.init({
    //open: false,
    injectChanges: true,
    notify: false, // Notification disabled
    // notify: {
    // 	styles: {
    // 		top: 'auto',
    // 		bottom: '0',
    // 	},
    // },
    server: {
      baseDir: 'dist',
      serveStaticOptions: {
        extensions: ['html'] // Hide .html extension
      }
    }
  })
  done()
}

function browsersyncReload(done) {
  browserSync.reload()
  done()
}



// Watch Task
function watchTask() {
  //watch('src/views/**/*.html', '!src/views/**/_*.html', series('fileincludeTask'))
  // dist klasöründe html dosyalarında değişiklik olduğunda tarayıcıyı reload
  //watch('dist/*.html', browsersyncReload)
  watch('src/scss/**/*.scss', scssTask) // Sadece css dosyalarını hot reload inject 
  // src klasöründe .scss ve .js dosyalarında değişiklik olduğunda tarayıcıyı reload
  //watch(['src/scss/**/*.scss', 'src/scripts/**/*.js', 'src/views/**/*.html'], series(scssTask, jsTask, fileincludeTask, browsersyncReload))
  watch('src/views/**/*.html', series(parallel(bsScssTask, fileincludeTask), browsersyncReload))
  watch('src/scripts/**/*.js', series(jsTask, browsersyncReload))
}

// Customize Bootstrap SCSS
function customizeBootstrap() {
  return src('src/scss/vendor/bootstrap_source/bootstrap.scss')
    .pipe(sass())
    .pipe(rename('_bootstrap.scss'))
    .pipe(dest('src/scss/inc'))
}


// DEV: Çalıştırmak için terminalde: gulp
exports.default = series(
  bsScssTask,
  jsTask,
  fileincludeTask,
  browsersyncServe,
  watchTask,
)


// CUSTOMIZE BOOTSTRAP: Çalıştırmak için terminalde: gulp bootstrap
exports.bootstrap = series(customizeBootstrap, bsScssTask)