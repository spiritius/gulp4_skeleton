const { src, dest, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const del = require('del');

async function clean(done) {
	del(['dist']);
	done();
}

function styles() {
	return src('src/scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				errLogToConsole: true,
				outputStyle: 'expanded',
			})
		)
		.on('error', console.error.bind(console))
		.pipe(
			postcss([
				autoprefixer({
					cascade: false,
					grid: true,
				}),
			])
		)
		.pipe(dest('dist/css'))
		.pipe(
			rename({
				suffix: '.min',
			})
		)
		.pipe(
			sass({
				errLogToConsole: true,
				outputStyle: 'compressed',
			})
		)
		.pipe(
			sourcemaps.write('/', {
				includeContent: false,
				sourceRoot: '../../src/sass',
			})
		)
		.pipe(dest('dist/css'))
		.pipe(browserSync.stream());
}

function pug_html() {
	return src('src/pug/*.pug')
		.pipe(
			pug({
				pretty: true,
			})
		)
		.pipe(dest('dist'))
		.pipe(browserSync.stream());
}

function html() {
	return src('src/*.html').pipe(dest('dist')).pipe(browserSync.stream());
}

function scripts() {
	return src('src/js/**/*.js')
		.pipe(dest('dist/js'))
		.pipe(uglify())
		.pipe(
			rename({
				suffix: '.min',
			})
		)
		.pipe(dest('dist/js'))
		.pipe(browserSync.stream());
}

function images() {
	return src('src/img/**/*')
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 85, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('dist/img'))
		.pipe(browserSync.stream());
}

function sync(done) {
	browserSync.init({
		server: {
			baseDir: './dist',
		},
	});
	done();
}

function watcher() {
	watch('src/scss/**/*.scss', { events: 'all', delay: 100 }, styles);
	watch('src/pug/**/*.pug', { events: 'all', delay: 100 }, pug_html);
	watch('src/**/*.html', { events: 'all', delay: 100 }, html);
	watch('src/js/**/*.js', { events: 'all', delay: 100 }, scripts);
	watch(
		[
			'src/img/**/*.png',
			'src/img/**/*.jpg',
			'src/img/**/*.svg',
			'src/img/**/*.gif',
		],
		{ events: 'all', delay: 100 },
		images
	);
}

exports.styles = styles;
exports.pug_html = pug_html;
exports.scripts = scripts;
exports.images = images;
exports.sync = sync;
exports.clean = clean;
exports.default = parallel(
	styles,
	html,
	scripts,
	pug_html,
	images,
	sync,
	watcher
);
