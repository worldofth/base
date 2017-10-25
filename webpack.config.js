var banner = require('./banner');
var pkg = require('./package.json');
var webpack = require('webpack');
var MinifyPlugin = require('babel-minify-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');

function init(isDev){
	var isProd = (process.env.NODE_ENV === 'production');

	var config = {
		entry: pkg.paths.src.js + pkg.vars.jsName,
		output: {
			filename: pkg.vars.bundledJsName,
			publicPath: pkg.publicPaths.js,
			pathinfo: true
		},
		devtool: 'eval',
		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
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

	if(isProd){
		config.output.filename = pkg.vars.prodJsName;
		var vendorFileName = pkg.vars.vendorJsFileName;

		if(!isDev){
			config.devtool = 'source-map';
		}

		var prodPlugins = [
			new webpack.optimize.ModuleConcatenationPlugin(),
			new webpack.optimize.CommonsChunkPlugin({
				name: pkg.vars.vendorJsName,
				filename: vendorFileName,
				minChunks: function(module) {
					return module.context && ~module.context.indexOf('node_modules');
				}
			}),
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

		var manifestBasePath = pkg.paths.production.js.replace(pkg.paths.production.base, '/');

		prodPlugins.push(
			new ManifestPlugin({
				fileName: 'manifest.json',
				basePath: manifestBasePath,
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

		config.plugins = config.plugins.concat(prodPlugins);
	}else{
		var devPlugins = [
			new webpack.NamedModulesPlugin()
		];
		config.plugins = config.plugins.concat(devPlugins);
	}

	return config;
}

module.exports = init;
