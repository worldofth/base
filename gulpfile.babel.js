import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';

import { scss, css, prodCss, revCss, cleanCss } from './gulp/css';
import pkg from './package.json';

const isBackend = pkg.isBackend;
const isProd = (process.env.NODE_ENV === 'production');

const plugins = loadPlugins({
	pattern: ['*'],
	scope: ['devDependencies']
});

const browserSyncInstance = plugins.browserSync.create();

const reload = function(done){
	plugins.fancyLog('-> Reloading Browser');
	plugins.fancyLog(' ');

	browserSyncInstance.reload();
	done && done();
};

const reloadCss = function(done){
	plugins.fancyLog('-> Reloading Css');
	plugins.fancyLog(' ');

	browserSyncInstance.reload('*.css');
	done && done();
};

// ====================
// css
// ====================

function setupCssPaths(){
	const scssPaths = {
		src: [pkg.paths.src.css + pkg.vars.scssName, pkg.paths.src.css + pkg.vars.styleguideScssName],
		include: pkg.paths.src.scss,
		dest: pkg.paths.build.css
	};

	const cssPaths = {
		src: pkg.globs.distCss,
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

	if(isBackend){
		cssPaths.dest = pkg.paths.public.css;
		prodCssPaths.dest = pkg.paths.public.css;
		revCssPaths.dest = pkg.paths.public.css;
		clearCssPaths.dest = pkg.paths.public.css;
	}

	return {
		scssPaths,
		cssPaths,
		prodCssPaths,
		revCssPaths,
		clearCssPaths
	};
}

function buildCss(){
	const { scssPaths, cssPaths, prodCssPaths, revCssPaths, clearCssPaths } = setupCssPaths();

	const scssFn = scss(scssPaths, plugins, gulp, isProd),

		cssFn = css(cssPaths, pkg.vars.cssName, plugins, gulp);

	if(isProd){
		const prodCssFn = prodCss(prodCssPaths, pkg.vars.cssName, plugins, gulp),

			revCssFn = revCss(revCssPaths, plugins, gulp),

			cleanCssFn = cleanCss(clearCssPaths, plugins);

		return gulp.series(cleanCssFn, scssFn, prodCssFn, revCssFn);
	}else{
		return gulp.series(scssFn, cssFn);
	}
}

function watchCss(){
	plugins.fancyLog('-> Watching Css & Scss');
	plugins.fancyLog(' ');

	gulp.watch(pkg.globs.watchCss, { awaitWriteFinish: true }, gulp.series(buildCss(), reloadCss));
}

gulp.task('default', gulp.series(buildCss(), watchCss));
