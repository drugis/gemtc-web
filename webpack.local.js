'use strict';
const merge = require('webpack-merge');
const prod = require('./webpack.dev');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let fs = require('fs');

module.exports = merge.smart(prod, {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'signin.html',
      template: 'app/signin.ejs',
      inject: 'head',
      chunks: ['signin'],
      signin: fs.readFileSync(require.resolve('signin/localSignin.html'))
    }),
  ]
});
