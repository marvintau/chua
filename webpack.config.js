const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
		filename: './src/index.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'chua',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader'
      }
    ]
  }
};