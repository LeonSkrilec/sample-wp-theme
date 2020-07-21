const dir = {
    src: "src/",
    build: "./",
  },
  { src, dest, watch } = require("gulp");
(gutil = require("gulp-util")),
  (newer = require("gulp-newer")),
  (imagemin = require("gulp-imagemin")),
  (sass = require("gulp-sass")),
  (postcss = require("gulp-postcss")),
  (deporder = require("gulp-deporder")),
  (concat = require("gulp-concat")),
  (stripdebug = require("gulp-strip-debug")),
  (uglify = require("gulp-uglify")),
  (browserSync = require("browser-sync").create());

const imageSettings = {
  src: dir.src + "images/**/*",
  build: dir.build + "assets/images/",
};

// CSS settings
const cssSettings = {
  src: dir.src + "sass/style.scss",
  watch: dir.src + "sass/**/*",
  build: dir.build,
  sassOpts: {
    outputStyle: "nested",
    imagePath: images.build,
    precision: 3,
    errLogToConsole: true,
  },
  processors: [
    require("postcss-assets")({
      loadPaths: ["images/"],
      basePath: dir.build,
      baseUrl: "/wp-content/themes/kranjska-gora/",
    }),
    require("autoprefixer"),
    require("css-mqpacker"),
    require("cssnano"),
  ],
};

const jsSettings = {
  src: dir.src + "js/**/*",
  build: dir.build + "js/",
  filename: "scripts.js",
};

const syncOptions = {
  proxy: "https://kranjska-gora.test",
  https: {
    key: "/Applications/MAMP/Library/OpenSSL/certs/kranjska-gora.test.key",
    cert: "/Applications/MAMP/Library/OpenSSL/certs/kranjska-gora.test.crt",
  },
  files: dir.build + "**/*",
  open: false,
  notify: false,
  ghostMode: false,
  ui: {
    port: 8001,
  },
};

function watcher(cb) {
  browsersync();
  watch([cssSettings.src], css);
  watch([jsSettings.src], js);
  watch([imageSettings.src], images);

  console.info("\nRun", "https://kranjska-gora.test:3000", " in browser.\n");

  return cb();
}

function images() {
  return src(imageSettings.src)
    .pipe(newer(imageSettings.build))
    .pipe(imagemin())
    .pipe(dest(imageSettings.build));
}

function css() {
  return src(cssSettings.src)
    .pipe(sass(cssSettings.sassOpts))
    .pipe(postcss(cssSettings.processors))
    .pipe(dest(cssSettings.build))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : gutil.noop());
}

function js() {
  return src(jsSettings.src)
    .pipe(deporder())
    .pipe(concat(jsSettings.filename))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(dest(jsSettings.build))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : gutil.noop());
}

function browsersync() {
  browserSync.init(syncOptions);
}

exports.browsersync = browsersync;
exports.images = images;
exports.js = js;
exports.css = css;
exports.default = watcher;
