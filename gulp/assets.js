import gulp from 'gulp';
import fancyLog from 'fancy-log';
import plumber from 'gulp-plumber';
import newer from 'gulp-newer';
import size from 'gulp-size';
import concat from 'gulp-concat';

import { onError } from './util';

export function copyAssets(path, assetName){
	return function copyAssets(){
		fancyLog(' ');
		fancyLog('-> Copying '+ assetName);

		return gulp.src(path.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(newer({dest: path.dest}))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(path.dest));
	};
}

export function inlineJs(paths, filename){
	return function inlineJs(){
		fancyLog(' ');
		fancyLog('-> Concating inline js');

		return gulp.src(paths.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(concat(filename))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}
