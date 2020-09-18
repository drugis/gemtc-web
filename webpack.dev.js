'use strict';

const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

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
  }
});
module.exports = config;
