const path = require('path');
const webpack = require('webpack');
//const DynamicImport = require('babel-plugin-syntax-dynamic-import');

module.exports = env => { // module.exports is function now to pass in env variable from cli defined in package.json
        return {
            entry: {
                'js/index': './src/index.js',
            },
            module: {
                rules: [{
                        test: /\.js$/,
                        exclude: [/node_modules/, /\.min\./, /vendor/],
                        use: [{
                                loader: 'babel-loader',
                                /*options: {
                                    plugins: [DynamicImport]
                                }*/
                            },
                            {
                                loader: 'eslint-loader'
                            }
                        ]},
                        {
                            test: /\.csv$/,
                            loader: 'file-loader',
                            options: {
                                name: 'data/[name].[ext]?v=[hash:6]', 
                            }
                        },
                        {
                            test: /\.md$/,
                            use: [
                                {
                                    loader: 'html-loader'
                                },
                                {
                                    loader: 'markdown-loader',
                                    options: {
                                        smartypants: true
                                    }
                                }
                            ]
                        },
                        {
                            test: /partials\/.*\.html$/,
                            use: 'html-loader'
                        }
                    ]
                },
               
                resolve: {
                    alias: {
                        "@App": path.join(__dirname, 'submodules/PCTApp-js/'),
                        "@Router": path.join(__dirname, 'submodules/ROUTR/'),
                        "@UI": path.join(__dirname, 'submodules/UI-js/'),
                        "@Project": path.join(__dirname, 'src'),
                        //"@Helpers": path.join(__dirname, '../../helpers/'),
                        "@Utils": path.join(__dirname, 'submodules/UTILS/'),
                        "@AutoComplete": path.join(__dirname, 'submodules/autoComplete.js/dist/'),
                        
                    }
                }
            }
        };