var path = require('path');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    rules: [{
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }, {
        test: /\.ttf$/,
        use: ['file-loader']
      }]
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new MiniCssExtractPlugin(),
  ]
};
