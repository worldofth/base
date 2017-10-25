import { onError } from './util';
import banner from '../banner';

export function scss(paths, plugins, gulp){
	return function scss(){
		plugins.fancyLog('-> Compiling scss');
		plugins.fancyLog(' ');

		return gulp.src(paths.src)
			.pipe(plugins.plumber({errorHandler: onError(plugins)}))
			.pipe(plugins.sourcemaps.init({loadMaps: true}))
			.pipe(plugins.sass({
				includePaths: paths.include
			}).on('error', plugins.sass.logError))
			.pipe(plugins.cached('sass_compiler'))
			.pipe(plugins.autoprefixer())
			.pipe(plugins.sourcemaps.write('./'))
			.pipe(plugins.size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function css(paths, filename, plugins, gulp){
	return function css(){
		plugins.fancyLog('-> Compiling css');
		plugins.fancyLog(' ');

		return gulp.src(paths.src)
			.pipe(plugins.plumber({errorHandler: onError(plugins)}))
			.pipe(plugins.newer({dest: paths.dest + filename}))
			.pipe(plugins.print())
			.pipe(plugins.sourcemaps.init({loadMaps: true}))
			.pipe(plugins.concat(filename))
			.pipe(plugins.sourcemaps.write('./'))
			.pipe(plugins.size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function prodCss(paths, filename, plugins, gulp){
	return function prodCss(){
		plugins.fancyLog('-> Compiling Production css');
		plugins.fancyLog(' ');

		return gulp.src(paths.src)
			.pipe(plugins.plumber({errorHandler: onError(plugins)}))
			.pipe(plugins.newer({dest: paths.dest + filename}))
			.pipe(plugins.print())
			.pipe(plugins.sourcemaps.init({loadMaps: true}))
			.pipe(plugins.concat(filename))
			.pipe(plugins.cssnano({
				discardComments: {
					removeAll: true
				},
				discardDuplicates: true,
				discardEmpty: true,
				minifyFontValues: true,
				minifySelectors: true
			}))
			.pipe(plugins.header(banner))
			.pipe(plugins.sourcemaps.write('./'))
			.pipe(plugins.size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function revCss(paths, plugins, gulp){
	return function revCss(){
		plugins.fancyLog('-> Revisioning Production css');
		plugins.fancyLog(' ');

		return gulp.src(paths.src)
			.pipe(plugins.sourcemaps.init({loadMaps: true}))
			.pipe(plugins.rev())
			.pipe(plugins.sourcemaps.write('./'))
			.pipe(plugins.size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest))
			.pipe(plugins.rev.manifest('manifest.json'))
			.pipe(gulp.dest(paths.dest));
	};
}

export function cleanCss(paths, plugins){
	return function cleanCss(done){
		plugins.fancyLog('-> Cleaning production js folder');
		plugins.fancyLog(' ');

		plugins.rimraf(paths.dest, done);
	};
}
