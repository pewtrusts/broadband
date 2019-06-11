const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = env => {
    return merge(common(), {
        mode: 'production',
        module: {
            rules: [{
                    test: /\.scss$/,
                    exclude: /css\/styles\.scss$/,
                    use: [{
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                localIdentName: '[path]-[local]',
                                sourceMap: true,
                                importLoaders: 1
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                ident: 'postcss',
                                plugins: (loader) => [
                                    require('postcss-inline-svg')(),
                                    require('postcss-assets')(),
                                    require('postcss-preset-env')({
                                        autoprefixer: {
                                            grid: true
                                        }
                                    }),
                                    require('cssnano')(),
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                    ]
                },
                {
                    test: /css\/styles\.scss$/,
                    //exclude: /exclude/,
                    use: [{
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: false,
                                sourceMap: true,
                                importLoaders: 1
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                ident: 'postcss',
                                plugins: (loader) => [
                                    require('postcss-inline-svg')(),
                                    require('postcss-assets')()
                                ]
                            }
                        }, {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [

            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "css/styles.css?v=[hash:6]",
                chunkFilename: "[id].css",
            })
        ]
    });
};