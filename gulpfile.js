var alias = require('postcss-alias');
var atimport = require('postcss-import');
var atrules = require('postcss-alias-atrules');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var cssnano = require('cssnano');
var dataselector = require('postcss-short-data');
var extend = require('postcss-extend');
var fakeid = require('postcss-fakeid');
var gulp = require('gulp');
var hexalpha = require('postcss-color-alpha');
var jshint = require('gulp-jshint');
var mediadefs = require('postcss-custom-media');
var mqpacker = require('css-mqpacker');
var mixins = require('postcss-sassy-mixins');
var nested = require('postcss-nested');
var plumber = require('gulp-plumber');
var position = require('postcss-position-alt');
var postcss = require('gulp-postcss');
var propdefs = require('postcss-define-property');
var propsort = require('css-declaration-sorter');
var pxtorem = require('postcss-pxtorem');
var rename = require('gulp-rename');
var svgsprite = require('gulp-svg-sprite');
var uglify = require('gulp-uglify');
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
			propdefs({
  			syntax: {
    			parameter: '?',
			   	variable: '?'
  			}
			}),
			alias,
			vars,
			extend,
			mixins,
			position,
			hexalpha,
			mediadefs,
			nested,
			dataselector,
			pxtorem,
			mqpacker,
			propsort({
				order: 'smacss'
			}),
			autoprefixer({browsers: ['last 2 versions']})
		];

		return gulp.src('./css/postcss/config/source.pcss')
			.pipe(plumber(plumberErrorHandler))
			.pipe(postcss(processors))
			.pipe(rename('app.css'))
			.pipe(gulp.dest('./css/'));
	});

	gulp.task('css:live', ['css'], function() {
		browserSync.reload();
	});

	gulp.task('css:min', ['css'], function() {
		return gulp.src('./css/app.css')
			.pipe(plumber(plumberErrorHandler))
			.pipe(postcss([cssnano]))
			.pipe(gulp.dest('./css/'));
	});

// ----- js
	gulp.task('js', function() {
		return gulp.src('./app.js')
			.pipe(jshint())
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(gulp.dest('./'));
	});

	gulp.task('js:live', ['js'], function() {
		browserSync.reload();
	});

	gulp.task('js:min', ['js'], function() {
		return gulp.src(['./app.js'])
			.pipe(uglify())
			.pipe(gulp.dest('./'));
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

// ----- minify
	gulp.task('min', ['css:min', 'js:min']);


// ----- browser-sync
	gulp.task('live', ['build'], function () {
		var project_path = __dirname.split('/');
		var project = 'localhost/' + project_path[project_path.length-1];

    browserSync.init({
    	proxy: project
    });

    gulp.watch('./*.html', function() {
			browserSync.reload();
		});

    gulp.watch('./app.js', ['js:live']);
    gulp.watch('./css/**/*.pcss', ['css:live']);
	});
