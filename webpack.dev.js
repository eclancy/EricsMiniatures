const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: 'development', 
    devtool: 'inline-source-map',
    plugins: [
        new CleanWebpackPlugin(),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
         new HtmlWebpackPlugin({
           title: 'Development',
         }),
       ],
    devServer:{
        contentBase: path.join(__dirname, 'public'), 
        historyApiFallback: true
    }
})
