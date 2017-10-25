import gulp from 'gulp';
import fancyLog from 'fancy-log';
import plumber from 'gulp-plumber';
import print from 'gulp-print';
import size from 'gulp-size';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import MinifyPlugin from 'babel-minify-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import webpackDevMiddleware from 'webpack-dev-middleware';
import chalk from 'chalk';
import rimraf from 'rimraf';

import { onError } from './util';
import banner from '../banner';

function setupWebackConfig(paths, filename, isProd, isBackend, isRevisioning, isDevMiddleware = false){
	const config = {
		entry: paths.src,
		output: {
			filename: filename,
			publicPath: paths.public,
			pathinfo: true
		},
		devtool: 'eval',
		module: {
			loaders: [
				{
					test: /\.js$/,
					loader: 'babel-loader',
					options: {
						presets: [
							['env', {'modules': false}]
						],
						plugins: ['transform-object-assign']
					}
				}
			]
		},
		plugins: []
	};

	if(isRevisioning && (isProd || isBackend)){
		config.plugins.push(
			new ManifestPlugin({
				fileName: 'manifest.json',
				basePath: paths.manifest,
				reduce: function(manifest, obj){
					if(~obj.name.indexOf('.map')){
						return manifest;
					}

					var name = obj.name.split('/');
					name = name.pop();

					manifest[name] = obj.path;
					return manifest;
				}
			})
		);
	}

	if(isProd){
		if(!isDevMiddleware){
			config.devtool = 'source-map';
		}

		const productionPlugins = [
			new webpack.optimize.ModuleConcatenationPlugin(),
			new MinifyPlugin({},{
				comments: false
			}),
			new webpack.HashedModuleIdsPlugin(),
			new webpack.BannerPlugin({
				banner: banner,
				raw: true,
				entryOnly: true
			})
		];

		config.plugins = config.plugins.concat(productionPlugins);
	}else{
		const developmentPlugins = [
			new webpack.NamedModulesPlugin()
		];

		config.plugins = config.plugins.concat(developmentPlugins);
	}

	return config;
}

export function compileJS(paths, filename, isProd, isBackend, isRevisioning){
	const webpackConfig = setupWebackConfig(paths, filename, isProd, isBackend, isRevisioning);

	return function compileJS(){
		fancyLog(' ');
		fancyLog('-> Bundling JS');

		return gulp.src(paths.src)
			.pipe(plumber({errorHandler: onError}))
			.pipe(print())
			.pipe(webpackStream( webpackConfig, null, function(err){
				if(err) {
					fancyLog.error(err);
				}
			} ))
			.pipe(size({gzip: true, showFiles: true}))
			.pipe(gulp.dest(paths.dest));
	};
}

export function jsDevMiddleware(paths, filename, reload){
	const webpackConfig = setupWebackConfig(paths, filename, false, false, false, true);

	return webpackDevMiddleware(webpack(webpackConfig), {
		publicPath: paths.public,
		reporter: function(obj){
			if(!obj.stats){
				return;
			}

			if(obj.stats.compilation.errors){
				obj.stats.compilation.errors.forEach(function(err){
					fancyLog.error(err);
				});
			}

			if(obj.stats.compilation.warnings){
				obj.stats.compilation.warnings.forEach(function(warn){
					fancyLog.warning(warn);
				});
			}

			Object.keys(obj.stats.compilation.assets).forEach(function(key){
				fancyLog('Webpack: updated ', chalk.green(key));
			});

			reload();
		}
	});
}

export function cleanJS(paths){
	return function cleanJS(done){
		fancyLog(' ');
		fancyLog('-> Cleaning js folder');

		rimraf(paths.dest, done);
	};
}
