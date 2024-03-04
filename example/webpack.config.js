'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


/**@type {import('webpack').Configuration}*/
const config = {
    target: 'web',
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        library: 'mynahWeb',
        libraryTarget: 'var',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/LIGHT.mynahuitc", to: "themes/LIGHT.mynahuitc" },
                { from: "src/DARK.mynahuitc", to: "themes/DARK.mynahuitc" },
            ],
        })
    ],
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    experiments: { asyncWebAssembly: true },
    module: {
        rules: [
            { test: /\.md$/, use: ['raw-loader'] },
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
};
module.exports = config;
