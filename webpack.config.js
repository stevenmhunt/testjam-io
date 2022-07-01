const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

var BUILD_DIR = path.resolve(__dirname, './build');
var CSS_DIR = path.resolve(BUILD_DIR, 'css');
var APP_DIR = path.resolve(__dirname, './src');

var jsxConfig = {
  entry: APP_DIR + '/App.jsx',
  output: {
    path: BUILD_DIR,
    filename: './js/testjam.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: "./www/index.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        use: 'babel-loader'
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
    rules: [
      {
        test: /\.(sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', {
          loader: "sass-loader",
          options: {
            sassOptions: {
              indentWidth: 4,
              includePaths: [path.resolve(__dirname, '../node_modules')],
            },
          },
        },]
      },
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?mimetype=image/svg+xml'},
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: "file-loader?mimetype=application/font-woff"},
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: "file-loader?mimetype=application/font-woff"},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: "file-loader?mimetype=application/octet-stream"},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: "file-loader"}
    ]
  },
  plugins: [new MiniCssExtractPlugin({
      filename: 'testjam.css'
    })]
};

module.exports = [jsxConfig, sassConfig];