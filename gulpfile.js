var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var svgsprite = require('gulp-svg-sprite');
var uglify = require('gulp-uglify');
var alias = require('postcss-alias');
var atrules = require('postcss-alias-atrules');
var hexalpha = require('postcss-color-alpha');
var mediadefs = require('postcss-custom-media');
var propdefs = require('postcss-define-property');
var fakeid = require('postcss-fakeid');
var atimport = require('postcss-import');
var nested = require('postcss-nested');
var position = require('postcss-position-alt');
var pxtorem = require('postcss-pxtorem');
var mixins = require('postcss-sassy-mixins');
var vars = require('postcss-simple-vars');

var plumberErrorHandler = {
	errorHandler: function(err) {
  	console.log(err.toString());
  	this.emit('end');
	}
};

// ----- sass/postcss
	gulp.task('css', function() {
		var processors = [
			atimport,
			atrules({
				rules: {
					colors: 'alias',
					type: 'alias',
					transition: 'alias'
				}
			}),
			alias,
			vars,
			propdefs({
  			syntax: {
    			parameter: '?',
			   	variable: '?'
  			}
			}),
			position,
			mixins,
			mediadefs,
			nested,
			pxtorem,
			hexalpha,
			mqpacker,
			autoprefixer,
			fakeid
		];
		return gulp.src('./css/postcss/config/source.pcss')
			.pipe(plumber(plumberErrorHandler))
			.pipe(postcss(processors))
			.pipe(rename('style.css'))
			.pipe(gulp.dest('./css/'));
	});

	gulp.task('css:live', ['css'], function() {
		browserSync.reload();
	});

	gulp.task('css:min', ['css'], function() {
		return gulp.src('./css/style.css')
			.pipe(plumber(plumberErrorHandler))
			.pipe(postcss([cssnano]))
			.pipe(gulp.dest('./css/'));
	});

// ----- js
	gulp.task('js', function() {
		return gulp.src('./js/scripts.js')
			.pipe(jshint())
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(gulp.dest('./js/'));
	});

	gulp.task('js:live', ['js'], function() {
		browserSync.reload();
	});

	gulp.task('js:min', ['js'], function() {
		return gulp.src(['./js/scripts.js'])
			.pipe(uglify())
			.pipe(gulp.dest('./js/'));
	});

// ----- icons
	gulp.task('icons', function() {
		var config = {
			mode: {
				symbol: true
			}
		};
		return gulp.src('./assets/svg-icons/*.svg')
			.pipe(svgsprite(config))
			.pipe(rename('icons.svg'))
			.pipe(gulp.dest('./assets/'));
	});

// ----- build
	gulp.task('build', ['icons', 'css', 'js']);

// ----- build
	gulp.task('min', ['css:min', 'js:min']);


// ----- browser-sync
	gulp.task('live', ['build'], function () {
		var project_path = __dirname.split('/');
		var project = 'localhost/' + project_path[project_path.length-1] + '/build';

    browserSync.init({
    	proxy: project
    });

    gulp.watch('./**/*.html', function() {
			browserSync.reload();
		});

    gulp.watch('./js/*.js', ['js:live']);
    gulp.watch(['./css/**/*.scss', './css/**/*.pcss'], ['css:live']);
	});
