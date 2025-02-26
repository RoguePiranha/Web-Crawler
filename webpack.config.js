const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
// const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  context: __dirname,
  entry: path.resolve(__dirname,'src/js/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'webapp/static')
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            // plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
      chunkFilename: '[id].css',
    })
    // new BrowserSyncPlugin({
    //   files: '**/*.html',
    //   host: 'localhost',
    //   port: 3000,
    //   proxy: 'localhost'
    // }),
  ],
};