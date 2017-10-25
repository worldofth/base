import gulp from 'gulp';
import fancyLog from 'fancy-log';
import glob from 'glob';
import concatMulti from 'gulp-concat-multi';
import htmlBeautify from 'gulp-html-beautify';

export function buildDemoHtml(paths){
	var htmlFiles = glob.sync(paths.src);
	var headerFile = paths.meta.head;
	var footerFile = paths.meta.foot;

	var concatFiles = {};
	for (var i = 0; i < htmlFiles.length; i++) {
		var htmlName = htmlFiles[i].split('/').pop().replace('pages-', '');
		concatFiles[htmlName] = [headerFile, htmlFiles[i], footerFile];
	}

	return function buildDemoHtml(){
		fancyLog('');
		fancyLog('-> compile demo html');

		return concatMulti(concatFiles)
			.pipe(htmlBeautify({
				indent_with_tabs: true,
				indent_size: 4
			}))
			.pipe(gulp.dest(paths.dest));
	};
}
