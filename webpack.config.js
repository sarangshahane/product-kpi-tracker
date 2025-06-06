const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  entry: {
		admin: path.resolve(
			__dirname,
			'admin-core/src/index.js'
		),
	},
  resolve: {
		alias: {
			...defaultConfig.resolve.alias,
			'@Admin': path.resolve( __dirname, 'admin-core/src/' ),
			'@Components': path.resolve( __dirname, 'admin-core/src/components/' ),
			'@Fields': path.resolve( __dirname, 'admin-core/src/fields/' ),
			'@Pages': path.resolve( __dirname, 'admin-core/src/pages/' ),
			'@Utils': path.resolve( __dirname, 'admin-core/src/utils/' ),
		},
	},
  output: {
    filename: '[name].js',
		path: path.resolve( __dirname, 'admin-core/build' ),
  },
};
