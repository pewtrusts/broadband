const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.nondev.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const pretty = require('pretty');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const repoName = 'hia';

module.exports = env => {
    var folder = env === 'localpreview' ? '/preview/' : '/docs/';
    return merge(common(), {
        devtool: 'inline-source-map', 
        plugins: [
            new CleanWebpackPlugin([folder.replace(/\//g,'')]),
            new HtmlWebpackPlugin({
                title: 'title title',
                template: './src/index-dev.html',
            }),
            new CopyWebpackPlugin([{
                from: './**/*.*',
                to: './',
                context: 'src/-/'
            }, {
                from: 'assets/**/*.*',
                exclude: 'assets/Pew/css/',
                context: 'src',
            }, {
                from: 'assets/Pew/css/*.*',
                context: 'src',
                transform(content, path) {
                    if ( env === 'localpreview'){
                        return content.toString();
                    } else  {
                        return content.toString().replace(/url\("\/([^/])/g, 'url("/' + repoName + '/$1').replace(/\/pew\//g,'/Pew/'); // this modifies the content of the files being copied; here making sure url('/...') is changed
                    }
                }
            }]),
            new PrerenderSPAPlugin({
                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, folder),
                // Required - Routes to render.
                routes: ['/'],
                renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
                    injectProperty: 'IS_PRERENDERING',
                    inject: true,
                    //renderAfterTime: 5000,
                    renderAfterDocumentEvent: 'all-views-ready',
                    headless: false
                }),
                postProcess: function(renderedRoute){
                    renderedRoute.html = pretty(renderedRoute.html);
                    return renderedRoute;
                }
            }),
            new webpack.EnvironmentPlugin({
                'NODE_ENV': env
            })
        ],
        output: {
            filename: '[name].js',
            path: path.join(__dirname, folder),
        }
      });
  };
   