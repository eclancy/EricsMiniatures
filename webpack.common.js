const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
require('webpack');

module.exports = (env, options) => {
    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.jsx$|\.es6$|\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/react'],
                        }
                    },
                },
                {
                    test: /\.s[ac]ss$/i,
                    exclude: /node_modules/,
                    use: [
                        // Creates `style` nodes from JS strings
                        'style-loader',
                        // Translates CSS into CommonJS
                        'css-loader',
                        // Compiles Sass to CSS
                        'sass-loader',
                    ],
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'images/'
                            }
                        }
                    ]
                },
            ],
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: 'style.css',
                chunkFilename: '[id].css'
            })
        ],

    }
}