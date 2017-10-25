import gulp from 'gulp';
import fancyLog from 'fancy-log';
import plumber from 'gulp-plumber';
import size from 'gulp-size';
import { join, basename } from 'path';
import patternLabNode from 'patternlab-node';

import { onError } from './util';
const patternLabConfig = {
	paths: {
		source: {},
		public: {}
	},
	styleGuideExcludes: [],
	defaultPattern: 'all',
	defaultShowPatternInfo: false,
	cleanPublic : true,
	patternExtension: 'mustache',
	'ignored-extensions' : ['scss', 'DS_Store', 'less'],
	'ignored-directories' : ['scss'],
	debug: false,
	ishControlsHide: {
		s: false,
		m: false,
		l: false,
		full: false,
		random: false,
		disco: false,
		hay: true,
		mqs: false,
		find: false,
		'views-all': false,
		'views-annotations': false,
		'views-code': false,
		'views-new': false,
		'tools-all': false,
		'tools-docs': false
	},
	ishMinimum: '240',
	ishMaximum: '2600',
	patternStateCascade: ['inprogress', 'inreview', 'complete'],
	patternStates: {},
	patternExportPatternPartials: [],
	cacheBust: true,
	starterkitSubDir: 'dist',
	outputFileSuffixes: {
		rendered: '.rendered',
		rawTemplate: '',
		markupOnly: '.markup-only'
	},
	cleanOutputHtml: true
};


export function copyStyleguideCss(paths){
	return function copyStyleguideCss(){
		fancyLog(' ');
		fancyLog('-> Copying styleguide css');

		return gulp.src(paths.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(function(file){
				file.path = join(file.base, basename(file.path));
				return join(paths.dest, '/css');
			}));
	};
}

export function buildPatternLab(pageExports, paths){
	const config = patternLabConfig;
	config.patternExportPatternPartials = pageExports;
	config.paths.source = paths.src;
	config.paths.source.root = paths.src.base;
	config.paths.public = paths.plPublic;
	config.paths.public.root = paths.plPublic.base;
	config.patternExportDirectory = paths.productionSrc.pages;

	const patternlab = patternLabNode(config);

	return function buildPatternLab(done){
		fancyLog(' ');
		fancyLog('-> Compiling Patternlab');

		const buildResult = patternlab.build(function(){}, config.cleanPublic);

		// handle async version of Pattern Lab
		if (buildResult instanceof Promise) {
			return buildResult.then(done);
		}

		// handle sync version of Pattern Lab
		done();
	};
}
