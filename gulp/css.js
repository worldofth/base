import gulp from 'gulp';
import fancyLog from 'fancy-log';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import cached from 'gulp-cached';
import autoprefixer from 'gulp-autoprefixer';
import size from 'gulp-size';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import header from 'gulp-header';
import rev from 'gulp-rev';
import rimraf from 'rimraf';
import print from 'gulp-print';

import { onError } from './util';
import banner from '../banner';

export function scss(paths){
	return function scss(){
		fancyLog(' ');
		fancyLog('-> Compiling scss');

		return gulp.src(paths.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sass({
				includePaths: paths.include
			}).on('error', sass.logError))
			.pipe(cached('sass_compiler'))
			.pipe(autoprefixer())
			.pipe(sourcemaps.write('./'))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function css(paths, filename, taskName = 'css'){
	return function css(){
		fancyLog(' ');
		fancyLog('-> Compiling '+taskName);

		return gulp.src(paths.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(print())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(concat(filename))
			.pipe(sourcemaps.write('./'))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function prodCss(paths, filename, taskName = 'css'){
	return function prodCss(){
		fancyLog(' ');
		fancyLog('-> Compiling Production '+taskName);

		return gulp.src(paths.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(print())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(concat(filename))
			.pipe(cssnano({
				discardComments: {
					removeAll: true
				},
				discardDuplicates: true,
				discardEmpty: true,
				minifyFontValues: true,
				minifySelectors: true
			}))
			.pipe(header(banner))
			.pipe(sourcemaps.write('./'))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function revCss(paths){
	return function revCss(){
		fancyLog(' ');
		fancyLog('-> Revisioning Production css');

		return gulp.src(paths.src)
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(print())
			.pipe(rev())
			.pipe(sourcemaps.write('./'))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest))
			.pipe(rev.manifest('manifest.json'))
			.pipe(gulp.dest(paths.dest));
	};
}

export function cleanCss(paths){
	return function cleanCss(done){
		fancyLog(' ');
		fancyLog('-> Cleaning production js folder');

		rimraf(paths.dest, done);
	};
}
