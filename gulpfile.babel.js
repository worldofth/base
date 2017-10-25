import gulp from 'gulp';
import fancyLog from 'fancy-log';

import { scss, css, prodCss, revCss, cleanCss } from './gulp/css';
import { compileJS, jsDevMiddleware, cleanJS } from './gulp/js';
import pkg from './package.json';
import { setupBrowserSync } from './gulp/util';

const { isBackend, isRevisioning } = pkg.buildOptions;
const isProd = (process.env.NODE_ENV === 'production');
const { browserSyncInstance, reload, reloadCss } = setupBrowserSync();

// ====================
// css
// ====================

function setupCssPaths(){
	const scssPaths = {
		src: [
			pkg.paths.src.css + pkg.vars.scssName,
			pkg.paths.src.css + pkg.vars.styleguideScssName,
			pkg.paths.src.css + pkg.vars.typographyScssName
		],
		include: pkg.paths.src.scss,
		dest: pkg.paths.build.css
	};

	const cssPaths = {
		src: pkg.globs.distCss,
		dest: pkg.paths.plPublic.css
	};

	const typographyCssPaths = {
		src: pkg.globs.typographyDistCss,
		dest: pkg.paths.plPublic.css
	};

	const prodCssPaths = {
		src: pkg.globs.prodDistCss,
		dest: pkg.paths.demo.css
	};

	const revCssPaths = {
		src: pkg.paths.demo.css + pkg.vars.cssName,
		dest: pkg.paths.demo.css
	};

	const clearCssPaths = {
		dest: pkg.paths.demo.css
	};

	if(isProd){
		typographyCssPaths.dest = pkg.paths.demo.css;
	}

	if(isBackend){
		cssPaths.dest = pkg.paths.public.css;
		prodCssPaths.dest = pkg.paths.public.css;
		revCssPaths.src = pkg.paths.public.css + pkg.vars.cssName;
		revCssPaths.dest = pkg.paths.public.css;
		clearCssPaths.dest = pkg.paths.public.css;
		typographyCssPaths.dest = pkg.paths.public.css;
	}

	return {
		scssPaths,
		cssPaths,
		typographyCssPaths,
		prodCssPaths,
		revCssPaths,
		clearCssPaths
	};
}

function buildCss(){
	const { scssPaths, cssPaths, typographyCssPaths, prodCssPaths, revCssPaths, clearCssPaths } = setupCssPaths();

	const scssFn = scss(scssPaths),
		revCssFn = revCss(revCssPaths),
		cleanCssFn = cleanCss(clearCssPaths);

	let cssFn,
		typographyCssFn;

	if(isProd){
		typographyCssFn = prodCss(typographyCssPaths, pkg.vars.typographyCssName, 'Typography Css');
		cssFn = prodCss(prodCssPaths, pkg.vars.cssName);
	}else{
		typographyCssFn = css(typographyCssPaths, pkg.vars.typographyCssName, 'Typography Css');
		cssFn = css(cssPaths, pkg.vars.cssName);
	}

	if(isBackend || isProd){
		if(isRevisioning){
			return gulp.series(cleanCssFn, scssFn, typographyCssFn, cssFn, revCssFn);
		}else{
			return gulp.series(scssFn, typographyCssFn, cssFn);
		}
	}

	return gulp.series(scssFn, cssFn);
}

function watchCss(){
	fancyLog(' ');
	fancyLog('-> Watching Css & Scss');

	gulp.watch(pkg.globs.watchCss, { awaitWriteFinish: true }, gulp.series(buildCss(), reloadCss));
}

// ====================
// js
// ====================

function setupJsPaths(){
	const paths = {
		src: pkg.paths.src.js + pkg.vars.jsName,
		public: pkg.publicPaths.js,
		manifest: '/',
		dest: pkg.paths.plPublic.js
	};

	if(isProd){
		paths.dest = pkg.paths.demo.js;
	}

	if(isBackend){
		paths.dest = pkg.paths.public.js;
	}

	let filename = pkg.vars.bundledJsName;

	if(isRevisioning && (isProd || isBackend)){
		filename = pkg.vars.prodJsName;
	}

	return {
		paths,
		filename
	};
}

function buildJS(){
	const { paths, filename } = setupJsPaths();

	const compileJSFn = compileJS(paths, filename, isProd, isBackend, isRevisioning),
		cleanJSFn = cleanJS(paths);

	if(isRevisioning && (isProd || isBackend)){
		return gulp.series(cleanJSFn, compileJSFn);
	}

	return gulp.series(compileJSFn);
}

function getJSDevMiddleware(){
	const { paths, filename } = setupJsPaths();

	return jsDevMiddleware(paths, filename, reload);
}

function watchJS(done){
	if(!isProd){
		done && done();
	}

	fancyLog(' ');
	fancyLog('-> Watching JS');

	gulp.watch(pkg.paths.src.js + '**/*.js', { awaitWriteFinish: true }, gulp.series(buildJS(), reload))
}

// ====================
// Serv
// ====================

function serv(done){
	if(isBackend){
		done && done();
		return;
	}

	var baseDir = pkg.paths.plPublic.base;
	if(isProd){
		baseDir = pkg.paths.demo.base;
	}

	var browserSyncConfig = {
		server: {
			baseDir: baseDir
		},
		notify: {
			styles: [
				'display: none',
				'padding: 15px',
				'font-family: sans-serif',
				'position: fixed',
				'font-size: 1em',
				'z-index: 9999',
				'bottom: 0px',
				'right: 0px',
				'border-top-left-radius: 5px',
				'background-color: #1B2032',
				'opacity: 0.4',
				'margin: 0',
				'color: white',
				'text-align: center'
			]
		}
	};

	if(!isProd){
		browserSyncConfig.snippetOptions = {
			blacklist: ['/index.html', '/', '/?*']
		};
		browserSyncConfig.middleware = [getJSDevMiddleware()];
	}

	browserSyncInstance.init(browserSyncConfig, function(){
		fancyLog(' ');
		fancyLog('-> Starting BrowserSync');
		done && done();
	});
}

gulp.task('default', gulp.series(serv));
