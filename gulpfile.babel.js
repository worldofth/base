import gulp from 'gulp';
import fancyLog from 'fancy-log';

import { scss, css, prodCss, revCss, cleanCss } from './gulp/css';
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

gulp.task('default', gulp.series(buildCss()));
