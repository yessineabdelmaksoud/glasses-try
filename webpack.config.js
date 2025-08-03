const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: './src/index.js',
    static: './src/image-to-image/static_image_processor.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: process.env.PUBLIC_PATH || '/'
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: 'src/static.html',
      filename: 'static.html',
      chunks: ['static']
    }),
    new CopyPlugin({
      patterns: [
        { from: "node_modules/@mediapipe/face_mesh", to: "mediapipe" },
        { from: "src/3d", to: "3d" },
      ],
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  devServer: {
    devMiddleware: {
      writeToDisk: true,
      mimeTypes: {
        'js': 'application/javascript',
        'wasm': 'application/wasm',
      }
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    client: {
      overlay: true,
    }
  }
};

module.exports = config;