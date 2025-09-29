const { src, dest, watch, series, parallel } = require("gulp");
const path = require("path");

// Plugins
const cssnano = require("cssnano");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const plumber = require("gulp-plumber");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const fileinclude = require("gulp-file-include");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const gulpif = require("gulp-if");
const newer = require("gulp-newer");
const del = require("del");

// Environment detection
const isProduction = process.env.NODE_ENV === "production";

// Paths configuration
const paths = {
  src: {
    scss: "src/scss/**/*.scss",
    scssExclude: "!src/scss/vendor/bootstrap_source/**/*.*",
    js: ["src/scripts/_bootstrap.bundle.js", "src/scripts/_navigation.js", "src/scripts/_swiper.js", "src/scripts/_custom.js"],
    html: ["src/views/**/*.html", "!src/views/**/_*.html"],
    bootstrap: "src/scss/vendor/bootstrap_source/bootstrap.scss",
  },
  dist: {
    css: "dist/assets/css",
    js: "dist/assets/js",
    html: "dist",
    bootstrap: "src/scss/inc",
  },
};

// Enhanced error handler
const errorHandler = {
  errorHandler: function (err) {
    console.log("\x1b[31m%s\x1b[0m", "✗ Error:", err.message);
    console.log("\x1b[33m%s\x1b[0m", "File:", err.relativePath || err.file);
    if (err.line) console.log("\x1b[33m%s\x1b[0m", "Line:", err.line);
    this.emit("end");
  },
};

// Clean task (only for CSS/JS/HTML, preserves images)
function clean() {
  return del(["dist/**/*.css", "dist/**/*.js", "dist/**/*.html", "dist/**/*.map", "!dist/assets/images/**/*"]);
}

// File includes task (optimized)
function fileincludeTask() {
  return src(paths.src.html)
    .pipe(plumber(errorHandler))
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        context: {
          env: isProduction ? "production" : "development",
          timestamp: Date.now(),
        },
      })
    )
    .pipe(dest(paths.dist.html));
}

// SCSS task with hot reload
function scssTask() {
  return src([paths.src.scss, paths.src.scssExclude], { sourcemaps: !isProduction })
    .pipe(plumber(errorHandler))
    .pipe(
      sass({
        outputStyle: isProduction ? "compressed" : "expanded",
        includePaths: ["node_modules"],
      })
    )
    .pipe(
      postcss([
        ...(isProduction
          ? [
              cssnano({
                preset: [
                  "default",
                  {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: true,
                  },
                ],
              }),
            ]
          : []),
      ])
    )
    .pipe(gulpif(!isProduction, dest(paths.dist.css, { sourcemaps: "." })))
    .pipe(gulpif(isProduction, dest(paths.dist.css)))
    .pipe(browserSync.stream());
}

// SCSS task without hot reload (for build)
function bsScssTask() {
  return src([paths.src.scss, paths.src.scssExclude], { sourcemaps: !isProduction })
    .pipe(plumber(errorHandler))
    .pipe(
      sass({
        outputStyle: isProduction ? "compressed" : "expanded",
        includePaths: ["node_modules"],
      })
    )
    .pipe(
      postcss([
        ...(isProduction
          ? [
              cssnano({
                preset: [
                  "default",
                  {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: true,
                  },
                ],
              }),
            ]
          : []),
      ])
    )
    .pipe(gulpif(!isProduction, dest(paths.dist.css, { sourcemaps: "." })))
    .pipe(gulpif(isProduction, dest(paths.dist.css)));
}

// JavaScript task (optimized)
function jsTask() {
  return src(paths.src.js, { sourcemaps: !isProduction })
    .pipe(plumber(errorHandler))
    .pipe(concat("script.js"))
    .pipe(
      gulpif(
        isProduction,
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
        })
      )
    )
    .pipe(
      gulpif(
        !isProduction,
        terser({
          compress: false,
          mangle: false,
          format: {
            beautify: true,
            comments: true,
          },
        })
      )
    )
    .pipe(gulpif(!isProduction, dest(paths.dist.js, { sourcemaps: "." })))
    .pipe(gulpif(isProduction, dest(paths.dist.js)));
}

// Vendor JS task (for third-party libraries)
function vendorJsTask() {
  const vendorFiles = [
    // Add vendor JS files here if needed
    // 'node_modules/some-library/dist/library.min.js'
  ];

  if (vendorFiles.length === 0) return Promise.resolve();

  return src(vendorFiles).pipe(plumber(errorHandler)).pipe(concat("vendor.js")).pipe(dest(paths.dist.js));
}

// BrowserSync serve
function browsersyncServe(done) {
  browserSync.init({
    server: {
      baseDir: "dist",
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
    port: 3000,
    open: false,
    notify: false,
    logLevel: "info",
    reloadOnRestart: true,
    injectChanges: true,
  });
  done();
}

// BrowserSync reload
function browsersyncReload(done) {
  browserSync.reload();
  done();
}

// Watch task (optimized)
function watchTask() {
  // Watch SCSS files for hot CSS injection
  watch([paths.src.scss, paths.src.scssExclude], scssTask);

  // Watch HTML files (including underscore files)
  watch(["src/views/**/*.html"], series(fileincludeTask, browsersyncReload));

  // Watch JS files
  watch("src/scripts/**/*.js", series(jsTask, browsersyncReload));

  // Watch for changes in images directory (for new images added manually)
  watch("dist/assets/images/**/*", browsersyncReload);
}

// Bootstrap customization task
function customizeBootstrap() {
  return src(paths.src.bootstrap)
    .pipe(plumber(errorHandler))
    .pipe(
      sass({
        includePaths: ["node_modules"],
      })
    )
    .pipe(rename("_bootstrap.scss"))
    .pipe(dest(paths.dist.bootstrap));
}

// Development task (no build process needed)
const dev = series(parallel(bsScssTask, jsTask, vendorJsTask, fileincludeTask), browsersyncServe, watchTask);

// Export tasks
exports.default = dev;
exports.dev = dev;
exports.clean = clean;
exports.bootstrap = series(customizeBootstrap, bsScssTask);
exports.scss = scssTask;
exports.js = jsTask;
exports.html = fileincludeTask;
