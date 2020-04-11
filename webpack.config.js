var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var JS_DIR = path.resolve(__dirname, './build/js');
var CSS_DIR = path.resolve(__dirname, './build/css');
var APP_DIR = path.resolve(__dirname, './src');

var jsxConfig = {
  entry: APP_DIR + '/App.jsx',
  output: {
    path: JS_DIR,
    filename: 'testjam.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader'
      }
    ]
  }
};

var sassConfig = {
  entry: APP_DIR + '/main.scss',
  output: {
    path: CSS_DIR,
    filename: 'testjam.styles.js'
  },
  module: {
    loaders: [
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      },
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?mimetype=image/svg+xml'},
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?mimetype=application/font-woff"},
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?mimetype=application/font-woff"},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?mimetype=application/octet-stream"},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"}
    ]
  },
  plugins: [new ExtractTextPlugin({
      filename: 'testjam.css',
      allChunks: true
    })]
};

module.exports = [jsxConfig, sassConfig];