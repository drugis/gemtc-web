'use strict';

 const merge = require('webpack-merge');
 const common = require('./webpack.common.js');

 let config = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
   module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  }
  //  devServer: {
  //    contentBase: './dist'
  //  }
 });





module.exports = config;
