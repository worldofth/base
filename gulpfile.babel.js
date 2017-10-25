import gulp from 'gulp';
import fancyLog from 'fancy-log';

import { scss, css, prodCss, revCss, cleanCss } from './gulp/css';
import { compileJS, jsDevMiddleware, cleanJS } from './gulp/js';
import { copyAssets, inlineJs, svgStore } from './gulp/assets';
import { copyStyleguideCss, buildPatternLab } from './gulp/patternlab';
import { buildDemoHtml } from './gulp/demo';
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
		manifest: pkg.publicPaths.manifest,
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

	gulp.watch(pkg.paths.src.js + '**/*.js', { awaitWriteFinish: true }, gulp.series(buildJS(), reload));
}

// ====================
// Assets
// ====================

function setupAssetPaths(){
	const inlineJSPaths = {
		src: pkg.globs.inlineJs,
		dest: pkg.paths.plPublic.vendorjs
	};

	const fontPaths = {
		src: pkg.paths.src.fonts + '**/*.*',
		dest: pkg.paths.plPublic.fonts
	};

	const imagePaths = {
		src: pkg.paths.src.img + '**/*.*',
		dest: pkg.paths.plPublic.img
	};

	const faviconPaths = {
		src: pkg.paths.src.base + pkg.vars.faviconName,
		dest: pkg.paths.plPublic.base
	};

	const svgPaths = {
		src: pkg.paths.src.svgicons + '*.svg',
		dest: pkg.paths.src.img
	};

	if(isProd){
		inlineJSPaths.dest = pkg.paths.demo.vendorjs;
		fontPaths.dest = pkg.paths.demo.fonts;
		imagePaths.dest = pkg.paths.demo.img;
		faviconPaths.dest = pkg.paths.demo.base;
	}

	if(isBackend){
		inlineJSPaths.dest = pkg.paths.public.vendorjs;
		fontPaths.dest = pkg.paths.public.fonts;
		imagePaths.dest = pkg.paths.public.img;
		faviconPaths.dest = pkg.paths.public.base;
	}

	return {
		inlineJSPaths,
		fontPaths,
		imagePaths,
		faviconPaths,
		svgPaths
	};
}

function updateAssets(){
	const { inlineJSPaths, fontPaths, imagePaths, faviconPaths, svgPaths } = setupAssetPaths();

	const inlineJSFn = inlineJs(inlineJSPaths, pkg.vars.inlineJs),
		fonts = copyAssets(fontPaths, 'Fonts'),
		image = copyAssets(imagePaths, 'Images'),
		favicon = copyAssets(faviconPaths, 'Favicon'),
		svgStoreFn = svgStore(svgPaths);

	if(isBackend){
		return gulp.series(inlineJSFn, fonts, svgStoreFn, image);
	}

	return gulp.series(inlineJSFn, fonts, svgStoreFn, image, favicon);
}

function watchAssets(){
	const { inlineJSPaths, fontPaths, imagePaths, faviconPaths, svgPaths } = setupAssetPaths();

	const inlineJSFn = inlineJs(inlineJSPaths, pkg.vars.inlineJs),
		fonts = copyAssets(fontPaths, 'Fonts'),
		image = copyAssets(imagePaths, 'Images'),
		favicon = copyAssets(faviconPaths, 'Favicon'),
		svgStoreFn = svgStore(svgPaths);

	fancyLog(' ');
	fancyLog('-> Watching inlinejs, fonts, images and favicon');
	gulp.watch(inlineJSPaths.src, { awaitWriteFinish: true }, gulp.series(inlineJSFn, reload));
	gulp.watch(fontPaths.src, { awaitWriteFinish: true }, gulp.series(fonts, reload));
	gulp.watch(imagePaths.src, { awaitWriteFinish: true }, gulp.series(image, reload));
	gulp.watch(faviconPaths.src, { awaitWriteFinish: true }, gulp.series(favicon, reload));
	gulp.watch(svgPaths.src, { awaitWriteFinish: true }, gulp.series(svgStoreFn, image, reload));
}

// ====================
// Pattern Lab
// ====================

function updatePatternLabAssets(){
	if(isProd || isBackend){
		return (done) => { done && done(); };
	}

	const copyStyleGuidePaths = {
		src: pkg.paths.src.styleguide + '**/!(*.css)',
		dest: pkg.paths.plPublic.base
	};

	const copyStyleGuideCssPaths = {
		src: pkg.paths.src.styleguide + '**/*.css',
		dest: pkg.paths.plPublic.styleguide
	};

	const copyStyleguide = copyAssets(copyStyleGuidePaths, 'styleguide files'),
		copyStyleguideCssFn = copyStyleguideCss(copyStyleGuideCssPaths);

	return gulp.series(copyStyleguideCssFn, copyStyleguide);
}

function watchStyleGuideFiles(){
	if(isProd || isBackend){
		return;
	}

	fancyLog('');
	fancyLog('-> Watching Styleguide files');

	const updatePatternLabAssetsFn = updatePatternLabAssets();

	gulp.watch(pkg.paths.src.styleguide + '**/!(*.css)', { awaitWriteFinish: true }, gulp.series(updatePatternLabAssetsFn, reload));
	gulp.watch(pkg.paths.src.styleguide + '**/*.css', { awaitWriteFinish: true }, gulp.series(updatePatternLabAssetsFn, reload));
}

function patternLabBuild(){
	if(isProd || isBackend){
		return (done) => { done && done(); };
	}
	return gulp.series(updatePatternLabAssets(), buildPatternLab(pkg.pageExports, pkg.paths));
}

function watchPatternLab(){
	if(isBackend){
		return;
	}

	fancyLog('');
	fancyLog('-> Watching Pattern Lab source files');

	const build = buildPatternLab(pkg.pageExports, pkg.paths);
	let buildSeries = gulp.series(build, reload);
	if(isProd){
		buildSeries = gulp.series(build);
	}

	gulp.watch(pkg.paths.src.patterns + '**/*.json', { awaitWriteFinish: true }, buildSeries);
	gulp.watch(pkg.paths.src.patterns + '**/*.md', { awaitWriteFinish: true }, buildSeries);
	gulp.watch(pkg.paths.src.patterns + '**/*.mustache', { awaitWriteFinish: true }, buildSeries);
	gulp.watch(pkg.paths.src.data + '**/*.json', { awaitWriteFinish: true }, buildSeries);
	gulp.watch(pkg.paths.src.meta + '**/*', { awaitWriteFinish: true }, buildSeries);
	gulp.watch(pkg.paths.src.annotations + '**/*', { awaitWriteFinish: true }, buildSeries);
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

// ====================
// Demo
// ====================

function buildDemo(){
	if(!isProd || isBackend){
		return (done) => { done && done(); };
	}

	const htmlPaths = {
		src: pkg.paths.productionSrc.pages + '*.html',
		meta: {
			head: pkg.paths.productionSrc.meta + pkg.vars.productionHeaderName,
			foot: pkg.paths.productionSrc.meta + pkg.vars.productionFooterName
		},
		dest: pkg.paths.demo.base
	};

	const buildHtml = buildDemoHtml(htmlPaths);

	return gulp.series(buildHtml);
}

function watchHtml(){
	if(!isProd || isBackend){
		return;
	}

	fancyLog('-> Watching pattern lab page exports');

	gulp.watch(pkg.paths.productionSrc.pages + '*.html', { awaitWriteFinish: true }, gulp.series(buildDemo(), reload));
}

// ====================
// Tasks
// ====================

function watch(){
	watchCss();
	watchJS();
	watchAssets();
	watchStyleGuideFiles();
	watchPatternLab();
	watchHtml();
}

function outputBuildInformation(done){
	let message = [];
	if(isProd){
		message.push('Production');
	}else{
		message.push('Development');
	}

	if(isBackend){
		message.push('Backend');
	}else{
		if(isProd){
			message.push('Demo');
		}else{
			message.push('PatternLab');
		}
	}

	if(isBackend || isProd){
		if(isRevisioning){
			message.push('Revisioning Assets');
		}else{
			message.push('Not Revisioning Assets');
		}
	}

	message = '-> Build: ' + message.join(', ');

	fancyLog('');
	fancyLog(message);
	fancyLog('');

	done && done();
}


// print out the options chosen, ie prod, backend, revisions etc.
gulp.task('build:js', gulp.series(outputBuildInformation, buildJS()));
gulp.task('build:css', gulp.series(outputBuildInformation, buildCss()));
gulp.task('watch', gulp.series(outputBuildInformation, updatePatternLabAssets(), updateAssets(), buildCss(), buildJS(), patternLabBuild(), buildDemo(), gulp.parallel(serv, watch)));
gulp.task('default', gulp.series(outputBuildInformation, updatePatternLabAssets(), updateAssets(), buildCss(), buildJS(), patternLabBuild(), buildDemo()));
