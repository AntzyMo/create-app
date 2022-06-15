const webpack = require('webpack')
module.exports = {
  target: 'node',
  mode: 'production',
  devtool: 'inline-source-map',
  entry: './core/index.ts',
  output: {
    filename: 'index.js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ]

}
