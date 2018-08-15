const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: { bundle: './src/ts/index.ts' },
  devtool: 'source-map',
  mode: process.env.MODE,
  plugins: [],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname),
    filename: './dist/[name].js',
  }
};

if(process.env.WEBPACK_SERVE) {
  module.exports.serve = {
    port: 3333,
    content: ['./src/html', './src'],
  }
}
