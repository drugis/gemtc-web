'use strict';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
let fs = require('fs');

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
      signin: fs.readFileSync(require.resolve('signin/googleSignin.html'))
    })
  ]
});
module.exports = config;
