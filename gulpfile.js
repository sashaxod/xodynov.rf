const {src, dest, watch, parallel, series} = require('gulp');

const scss   = require('gulp-sass')(require('sass')); // Конвертация в css и сжатие ({outputStyle: 'compressed'})
const concat = require('gulp-concat'); //объединение и переименование файлов
const uglify = require('gulp-uglify-es').default; //сжатие файлов скриптов
const browserSync = require("browser-sync").create(); // запуск браузера
const autoprefixer = require('gulp-autoprefixer'); // автопрефиксы
const clean = require('gulp-clean'); // удаление
const avif = require('gulp-avif'); 
const webp = require('gulp-webp'); 
const imagemin = require('gulp-imagemin'); 
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const include = require('gulp-include'); // объединение html файлов
const htmlmin = require('gulp-htmlmin'); // минимизация html


// Работа с картинками

function images() {
   return src(['app/images/**/*.*', '!app/images/**/*.svg'])
   .pipe(newer('build/images/'))
   .pipe(avif({ quality : 50 }))

   .pipe(src('app/images/**/*.*'))
   .pipe(newer('build/images/'))
   .pipe(webp())

   .pipe(src('app/images/**/*.*'))
   .pipe(newer('build/images/'))
   .pipe(imagemin())

   .pipe(dest('build/images/'))
} 

function sprite() {
   return src('app/images/dist/*.svg')
      .pipe(svgSprite({

      }))
      .pipe(dest('app/images/dist'))
}

// Работа со шрифтами

function fonts() {
   return src('app/fonts/*.*')
   .pipe(fonter({
      formats: ['woff', 'ttf']
   }))
   .pipe(src('app/fonts/*.ttf'))
   .pipe(ttf2woff2())
   .pipe(dest('build/fonts'))
}

// Работа со скриптами
function scripts() {
   return src('app/js/main.js')
      .pipe(dest('build/js'))
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('dist/js'))
      .pipe(browserSync.stream())
}


// Работа со стилями
function styles() {
   return src([
      'app/scss/style.scss',
      'app/scss/MC.scss'
   ])
      .pipe(autoprefixer({overrideBrowserslist: ['last 10 version']}))
      .pipe(scss())
      .pipe(dest('build/css'))
      .pipe(scss({outputStyle: 'compressed'}))
      .pipe(concat('style.min.css'))
      .pipe(dest('dist/css'))
      .pipe(browserSync.stream())
}

// работа с HTML файлами
function html() {
   return src('app/html/**/*')
      .pipe(include({
         includePaths: 'app/html/components'
      }))
      .pipe(dest('build/html/'))
      .pipe(browserSync.stream())
}
function minhtml() {
   return src([
      'build/html/index.html'
   ], {base : 'build'})
   .pipe(htmlmin({ collapseWhitespace: true }))
   .pipe(dest('dist'))
}

function watching() {
   browserSync.init({
      server: {
          baseDir: "dist/html/"
      }
  });
   watch(['app/scss/*.scss'], styles)
   watch(['app/fonts/*.*'], fonts)
   watch(['app/images/src'], images)
   watch(['app/js/main.js'], scripts) 
   watch(['app/html/*'], html) 
   watch(['build/html/*'], minhtml) 
   watch(['app/**/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
   return src('dist/**/*.*')
      .pipe(clean())
}
function cleanBuild() {
   return src('build/**/*.*')
      .pipe(clean())
}

// Копируем файлы
function copy() {
   return src([
      'build/fonts/*.*',
      'build/images/**/*.avif'

   ], {base : 'build'})
   .pipe(dest('dist'))
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.html = html;
exports.minhtml = minhtml;
exports.scripts = scripts;
exports.watching = watching;
exports.copy = copy;

exports.default = parallel(fonts, images, styles, scripts, html, minhtml, copy, watching);