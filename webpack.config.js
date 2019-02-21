

var HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')


require('dotenv').config()

const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');
var ImageminPlugin = require('imagemin-webpack-plugin').default
const CleanWebpackPlugin = require('clean-webpack-plugin')

var outputDir = path.resolve(__dirname, 'www/build')

var proxy = require('http-proxy-middleware');



module.exports = {
    entry: {
        _entry_home_: './www/js/main.js'
    },
    output: {
        filename: process.env.production ? '[name].[chunkhash:10].js' : '[name].[hash:10].js',
        path: outputDir,
        publicPath: "/build/"
    },
    mode: "development",
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, "../../_modules"), path.resolve(__dirname, "../../global")]
    },
    devServer: {
        overlay: true,
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, 'www'),
        writeToDisk: (filePath) => {
            if(/sw\.js/.test(filePath)) {
                return true;
            }
            return /(?:\.html)/.test(filePath);
        },
        publicPath: "/build/",
        before: function(app, server) {
            app.use('/api', proxy({ target: 'http://localhost:3013', changeOrigin: true }));
            app.use('/modules', proxy({ target: 'http://localhost:3013', changeOrigin: true }));
            app.use('/templates', proxy({ target: 'http://localhost:3013', changeOrigin: true }));
        },
        host: '*',
        port: 3010
    },
    // devtool: "source-map", // production
    // devtool: "eval-source-map",
    module: {
        rules: [{
                test: /[\\/]_modules[\\/]jquery/,
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
                }, {
                    loader: 'expose-loader',
                    options: '$'
                }]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }, {
                test: /\.pug$/,
                use: [
                    'pug-loader'
                ]
            }, {
                test: /\.pug2$/,
                use: [
                    'pug-plain-loader'
                ]
            }, {
                test: /\.styl$/,
                use: [
                    'style-loader',
                    'css-loader',
                    "stylus-loader"
                ]
            }, {
                test: /\.sass$/,
                use: [
                    'style-loader',
                    'css-loader',
                    "sass-loader"
                ]
            }, {
                test: /\.(png|svg|jpg|gif|woff|ttf|eot|swf)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[hash].[ext]',
                    publicPath: 'build/assets/',
                    outputPath: 'assets/'
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        // Make sure that the plugin is after any plugins that add images
        new ImageminPlugin({
            // disable: process.env.NODE_ENV !== 'production', // Disable during development
            pngquant: {
                quality: '50'
            }
        }),
        new WorkboxPlugin.InjectManifest({
            swSrc: './www/src/sw.js',
            swDest: '../sw.js'
        }),
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: 'www/index-template.html',
            belong_entry: "_entry_home_",
            inject: false
        }),
        new CleanWebpackPlugin(path.resolve(__dirname, "www/build/*"), {})
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                modules: {
                    test: /[\\/]_modules[\\/]/,
                    priority: -9
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
};


