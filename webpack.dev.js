'use strict';
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
let basePath = path.join(__dirname, '/');
let fs = require('fs');

const MATOMO_VERSION = process.env.MATOMO_VERSION
  ? process.env.MATOMO_VERSION
  : 'Test';

let config = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader',
        options: {
          esModule: false
        }
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {
          esModule: false
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'signin.html',
      template: 'app/signin.ejs',
      inject: 'head',
      chunks: ['signin'],
      signin: fs.readFileSync(require.resolve('signin/googleSignin.html')),
      matomo: fs.readFileSync(
        require.resolve(basePath + '/app/matomo' + MATOMO_VERSION + '.html')
      )
    })
  ]
});
module.exports = config;
