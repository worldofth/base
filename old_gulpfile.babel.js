var pkg = require('./package.json');
var gulp = require('gulp');
var path = require('path');
var isProd = (process.env.NODE_ENV === 'production');

var $ = require('gulp-load-plugins')({
	pattern: ['*'],
	scope: ['devDependencies']
});

var onError = function(err){
	$.fancyLog.error(err);
};

var browserSyncInstance = $.browserSync.create();

var reload = function(done){
	browserSyncInstance.reload();
	done && done();
};

var reloadCss = function(done){
	browserSyncInstance.reload('*.css');
	done && done();
};

var banner = require('./banner');

// ====================
// css
// ====================

function scss(){
	$.fancyLog('-> Compiling scss');

	var scssSrc = [pkg.paths.src.css + pkg.vars.scssName, pkg.paths.src.css + pkg.vars.styleguideScssName];
	if(isProd){
		scssSrc = pkg.paths.src.css + pkg.vars.scssName;
	}

	return gulp.src(scssSrc)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.sass({
			includePaths: pkg.paths.src.scss
		}).on('error', $.sass.logError))
		.pipe($.cached('sass_compiler'))
		.pipe($.autoprefixer())
		.pipe($.sourcemaps.write('./'))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(pkg.paths.build.css));
}

function css(){
	$.fancyLog('-> Compiling css');
	return gulp.src(pkg.globs.distCss)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.newer({dest: pkg.paths.public.css + pkg.vars.cssName}))
		.pipe($.print())
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.concat(pkg.vars.cssName))
		.pipe($.sourcemaps.write('./'))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(pkg.paths.public.css));
}

function prodCss(){
	$.fancyLog('-> Compiling Production css');
	return gulp.src(pkg.globs.prodDistCss)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.newer({dest: pkg.paths.production.css + pkg.vars.prodCssName}))
		.pipe($.print())
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.concat(pkg.vars.prodCssName))
		.pipe($.cssnano({
			discardComments: {
				removeAll: true
			},
			discardDuplicates: true,
			discardEmpty: true,
			minifyFontValues: true,
			minifySelectors: true
		}))
		.pipe($.header(banner))
		.pipe($.sourcemaps.write('./'))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(pkg.paths.production.css));
}

function revCss(){
	$.fancyLog('-> Revisioning Production css');

	return gulp.src(pkg.paths.production.css + pkg.vars.prodCssName)
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.rev())
		.pipe($.sourcemaps.write('./'))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(pkg.paths.production.css))
		.pipe($.rev.manifest('manifest.json'))
		.pipe(gulp.dest(pkg.paths.production.css));
}

function cleanCss(done){
	$.fancyLog('-> Cleaning production js folder');

	$.rimraf(pkg.paths.production.css, done);
}

var buildCss = gulp.series(scss, css);
if(isProd){
	buildCss = gulp.series(cleanCss, scss, prodCss, revCss);
}

function watchCss(){
	$.fancyLog('-> Watching Css & Scss');
	gulp.watch(pkg.globs.watchCss, { awaitWriteFinish: true }, gulp.series(buildCss, reloadCss));
}

// ====================
// Critical css
// ====================

// todo

// ====================
// js
// ====================

function js(){
	if(isProd){
		$.fancyLog('-> Bundling JS via webpack ...');
	}else{
		$.fancyLog('-> Bundling Production JS via webpack ...');
	}

	var jsDest = pkg.paths.public.js;
	if(isProd){
		jsDest = pkg.paths.production.js;
	}

	return gulp.src(pkg.paths.src.js + pkg.vars.jsName)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.print())
		.pipe($.webpackStream( require('./webpack.config')(), null, function(err){
			if(err) {
				$.fancyLog.error(err);
			}
		} ))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(jsDest));
}

function cleanJS(done){
	var jsDest = pkg.paths.build.js;

	if(isProd){
		jsDest = pkg.paths.production.js;
		$.fancyLog('-> Cleaning production js folder');
	}else{
		$.fancyLog('-> Cleaning js folder');
	}

	$.rimraf(jsDest, done);
}

function jsDev(){
	return $.webpackDevMiddleware( $.webpack( require('./webpack.config')(true) ), {
		publicPath: '/js/',
		reporter: function(obj){
			if(!obj.stats){
				return;
			}

			if(obj.stats.compilation.errors){
				obj.stats.compilation.errors.forEach(function(err){
					$.fancyLog.error(err);
				});
			}

			if(obj.stats.compilation.warnings){
				obj.stats.compilation.warnings.forEach(function(warn){
					$.fancyLog.warning(warn);
				});
			}

			Object.keys(obj.stats.compilation.assets).forEach(function(key){
				$.fancyLog('Webpack: updated ', $.chalk.green(key));
			});

			reload();
		}
	});
}

var buildJS = gulp.series(cleanJS, js);

function watchJS(done){
	if(!isProd){
		done && done();
		return;
	}

	$.fancyLog('-> Watching js');

	gulp.watch(pkg.paths.src.js + '**/*.js', { awaitWriteFinish: true }, gulp.series(buildJS, reload));
}

// ====================
// Assets
// ====================

function copyAssets(src, dest){
	return gulp.src(src)
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.newer({dest: dest}))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(dest));
}

function inlineJs(){
	$.fancyLog('-> Copying inline js');

	var inlineDest = pkg.paths.public.vendorjs;
	if(isProd){
		inlineDest = pkg.paths.production.vendorjs;
	}

	return copyAssets(pkg.globs.inlineJs, inlineDest);
}

function fonts(){
	$.fancyLog('-> Copying Fonts');

	var fontDest = pkg.paths.public.fonts;
	if(isProd){
		fontDest = pkg.paths.production.fonts;
	}

	return copyAssets(pkg.paths.src.fonts + '*.*', fontDest);
}

function images(){
	$.fancyLog('-> Copying images');

	var imageDest = pkg.paths.public.img;
	if(isProd){
		imageDest = pkg.paths.production.img;
	}

	return copyAssets(pkg.paths.src.img + '*.*', imageDest);
}

function favicon(){
	$.fancyLog('-> Copying favicon');

	var faviconDest = pkg.paths.public.base;
	if(isProd){
		faviconDest = pkg.paths.production.base;
	}

	return copyAssets(pkg.paths.src.base + pkg.vars.faviconName, faviconDest);
}

var updateAssets = gulp.parallel(inlineJs, fonts, images, favicon);

function watchAssets(){
	$.fancyLog('-> Watching inlinejs, fonts, images and favicon');
	gulp.watch(pkg.globs.inlineJs, { awaitWriteFinish: true }, gulp.series(inlineJs, reload));
	gulp.watch(pkg.paths.src.fonts + '*.*', { awaitWriteFinish: true }, gulp.series(fonts, reload));
	gulp.watch(pkg.paths.src.img + '*.*', { awaitWriteFinish: true }, gulp.series(images, reload));
	gulp.watch(pkg.paths.src.base + pkg.vars.faviconName, { awaitWriteFinish: true }, gulp.series(favicon, reload));
}

// ====================
// SVG Icons
// ====================

function svgstore(){
	$.fancyLog('-> Compiling svgs');

	return gulp.src(pkg.paths.src.svgicons + '*.svg')
		.pipe($.svgmin(function(file){
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				js2svg: {
					pretty: true
				},
				plugins: [{
					cleanupIDs: {
						prefix: prefix + '-',
						minify: true
					}
				},{
					cleanupNumericValues: {
						floatPrecision: 5
					},
				},
				{
					removeTitle: true
				},{
					sortAttrs: true
				},{
					convertShapeToPath: false
				}]
			};
		}))
		.pipe($.svgstore())
		.pipe(gulp.dest(pkg.paths.src.img));
}

var updateSvgIcons = gulp.series(svgstore, images);

function watchSvgIcons(){
	$.fancyLog('-> Watching Svg Icons');
	gulp.watch(pkg.paths.src.svgicons + '*.svg', { awaitWriteFinish: true }, gulp.series(updateSvgIcons, reload));
}

// ====================
// testing
// ====================

// todo

// ====================
// Pattern Lab
// ====================

function copyStyleguide(done){
	$.fancyLog('-> Copying styleguide files');

	if(isProd){
		done && done();
		return;
	}

	return copyAssets(pkg.paths.src.styleguide + '**/!(*.css)', pkg.paths.public.base);
}

function copyStyleguideCss(done){
	$.fancyLog('-> Copying styleguide css');

	if(isProd){
		done && done();
		return;
	}

	return gulp.src(pkg.paths.src.styleguide + '**/*.css')
		.pipe($.plumber({errorHandler: onError}))
		.pipe($.newer({dest: pkg.paths.public.styleguide + 'css'}))
		.pipe($.size({gzip: true, showFiles: true}))
		.pipe(gulp.dest(function(file){
			file.path = path.join(file.base, path.basename(file.path));
			return path.join(pkg.paths.public.styleguide, '/css');
		}));
}

var updateStyleGuideAssets = gulp.parallel(copyStyleguide, copyStyleguideCss);

function watchStyleguideFiles(){
	$.fancyLog('-> Watching Styleguide files');

	gulp.watch(pkg.paths.src.styleguide + '**/!(*.css)', { awaitWriteFinish: true }, gulp.series(copyStyleguide, reload));
	gulp.watch(pkg.paths.src.styleguide + '**/*.css', { awaitWriteFinish: true }, gulp.series(copyStyleguideCss, reload));
}

var patternlabConfig = require('./patternlab-config.json');
patternlabConfig.patternExportPatternPartials = pkg.pageExports;
var patternlab = require('patternlab-node')(patternlabConfig);

function build(done) {
	$.fancyLog('-> Compiling Patternlab');

	var buildResult = patternlab.build(function(){}, patternlabConfig.cleanPublic);

	// handle async version of Pattern Lab
	if (buildResult instanceof Promise) {
		return buildResult.then(done);
	}

	// handle sync version of Pattern Lab
	done();
	return;
}

var patternLabBuild = gulp.series(updateStyleGuideAssets, build);

function watchStyleguideSourceFiles(){
	$.fancyLog('-> Watching Styleguide Source Files');

	gulp.watch(pkg.paths.src.patterns + '**/*.json', { awaitWriteFinish: true }, gulp.series(build, reload));
	gulp.watch(pkg.paths.src.patterns + '**/*.md', { awaitWriteFinish: true }, gulp.series(build, reload));
	gulp.watch(pkg.paths.src.patterns + '**/*.mustache', { awaitWriteFinish: true }, gulp.series(build, reload));
	gulp.watch(pkg.paths.src.data + '**/*.json', { awaitWriteFinish: true }, gulp.series(build, reload));
	gulp.watch(pkg.paths.src.meta + '**/*', { awaitWriteFinish: true }, gulp.series(build, reload));
	gulp.watch(pkg.paths.src.annotations + '**/*', { awaitWriteFinish: true }, gulp.series(build, reload));
}

// ====================
// Html
// ====================

function htmlProdBuild(done){
	if(!isProd){
		done && done();
		return;
	}

	var htmlFiles = $.glob.sync(pkg.paths.productionSrc.pages + '*.html');
	var headerFile = pkg.paths.productionSrc.meta + pkg.vars.productionHeaderName;
	var footerFile = pkg.paths.productionSrc.meta + pkg.vars.productionFooterName;

	var concatFiles = {};
	for (var i = 0; i < htmlFiles.length; i++) {
		var htmlName = htmlFiles[i].split('/').pop().replace('pages-', '');
		concatFiles[htmlName] = [headerFile, htmlFiles[i], footerFile];
	}

	return $.concatMulti(concatFiles)
		.pipe($.htmlBeautify({
			indent_with_tabs: true,
			indent_size: 4
		}))
		.pipe(gulp.dest(pkg.paths.production.base));
}

function watchHtml(){
	if(!isProd){
		return;
	}

	$.fancyLog('-> Watching pattern lab page exports');

	gulp.watch(pkg.paths.productionSrc.pages + '*.html', { awaitWriteFinish: true }, gulp.series(htmlProdBuild, reload));
}

// ====================
// Serv
// ====================

function serv(done){
	var baseDir = pkg.paths.public.base;
	if(isProd){
		baseDir = pkg.paths.production.base;
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
		},
		middleware: [
			jsDev()
		]
	};

	if(!isProd){
		browserSyncConfig.snippetOptions = {
			blacklist: ['/index.html', '/', '/?*']
		};
	}

	browserSyncInstance.init(browserSyncConfig, function(){
		$.fancyLog('-> Starting BrowserSync');
		done && done();
	});
}

function servBuild(done){
	if(!isProd){
		done && done();
		return;
	}

	var baseDir = pkg.paths.production.base;

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

	browserSyncInstance.init(browserSyncConfig, function(){
		$.fancyLog('-> Starting BrowserSync');
		done && done();
	});
}

// ====================
// Tasks
// ====================

function watch(){
	watchCss();
	watchJS();
	watchAssets();
	watchSvgIcons();
	watchStyleguideFiles();
	watchStyleguideSourceFiles();
	watchHtml();
}

gulp.task('updateSvgIcons', updateSvgIcons);
gulp.task('updateAssets', updateAssets);
gulp.task('build', gulp.series(svgstore, updateAssets, buildCss, buildJS, patternLabBuild, htmlProdBuild, gulp.parallel(servBuild, watch)));
gulp.task('default', gulp.series(updateAssets, buildCss, patternLabBuild, htmlProdBuild, gulp.parallel(serv, watch)));

// TODO
// add webpack dev middleware back into prod build
