const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: {
        background: './src/background.js',
        content: './src/content.js',
        popup: './src/popup.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            // {
            //     test: /\.html$/,
            //     use: 'html-loader'
            // }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles/[name].bundle.css'
        }),
        new HtmlWebpackPlugin({
            template: 'static/popup.html',
            filename: 'popup.bundle.html',
            chunks: ['popup']
        }),
    ]
};
