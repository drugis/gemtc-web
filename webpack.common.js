'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
let basePath = path.join(__dirname, '/');
let fs = require('fs');

const MATOMO_VERSION = process.env.MATOMO_VERSION
  ? process.env.MATOMO_VERSION
  : 'Test';

let config = {
  entry: {
    main: basePath + '/app/js/main.js',
    signin: basePath + '/app/js/signin.js',
    manual: basePath + '/app/js/manual.js'
  },

  output: {
    // Output directory
    path: basePath + '/dist/',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
  },

  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/, // <-- This

    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'angular1-templateurl-loader'
          }
        ],
        exclude: [/.*angular-foundation-6./] // uses $templatecache so dont replace
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        options: {
          esModule: false
        }
      },
      {
        test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/', // where the fonts will go
              publicPath: 'fonts/' // override the default path
            }
          }
        ]
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8000, // Convert images < 8kb to base64 strings
              name: 'images/[hash]-[name].[ext]'
            }
          }
        ]
      }
    ]
  },

  resolve: {
    alias: {
      'gemtc-web': basePath + '/app/js',
      app: basePath + '/app/js/app'
    },
    modules: [
      // Files path which will be referenced while bundling
      'node_modules',
      basePath + '/app'
    ],
    extensions: ['.css', 'html', '.js', '.json'] // File types
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'app/index.ejs',
      inject: 'head',
      chunks: ['main'],
      matomo: fs.readFileSync(
        require.resolve(basePath + '/app/matomo' + MATOMO_VERSION + '.html')
      )
    }),
    new HtmlWebpackPlugin({
      filename: 'manual.html',
      template: 'app/manual.ejs',
      inject: 'head',
      chunks: ['manual'],
      matomo: fs.readFileSync(
        require.resolve(basePath + '/app/matomo' + MATOMO_VERSION + '.html')
      )
    }),
    new CleanWebpackPlugin()
  ],

  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false
    }
  }
};

module.exports = config;
