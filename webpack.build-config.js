var pkg = require('./package.json');

var config = {
	entry: pkg.paths.src.js + pkg.vars.jsName,
	output: {
		filename: pkg.vars.bundledJsName,
		pathinfo: true
	},
	devtool: 'eval',
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};

module.exports = config;
