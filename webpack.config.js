const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env = {}, argv = {}) => {
  const isProd = argv.mode === 'production';

  return {
    entry: {
      main: path.resolve(__dirname, 'admin/assets/src/index.js'),
      // Additional entries can be added here (e.g., settings page)
    },
    output: {
      path: path.resolve(__dirname, 'admin/assets/build'),
      filename: isProd ? '[name].min.js' : '[name].js',
      publicPath: '',
      clean: true,
    },
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: !isProd,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProd,
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].min.css' : '[name].css',
      }),
    ],
    optimization: {
      minimize: isProd,
    },
  };
};
