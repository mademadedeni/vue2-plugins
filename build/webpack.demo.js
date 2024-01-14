const path = require('path');
const webpack = require('webpack');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const launchEditorMiddleware = require('launch-editor-middleware');

const config = require('./config');

// const isProd = process.env.NODE_ENV === 'production';

const webpackConfig = {
  mode: process.env.NODE_ENV,
  entry: './examples/entry.js',
  output: {
    path: path.resolve(process.cwd(), './examples/element-ui/'),
    publicPath: '',
    filename: '[name].[hash:7].js',
    chunkFilename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: config.alias,
    modules: ['node_modules']
  },
  devServer: {
    host: '0.0.0.0',
    port: 8085,
    publicPath: '/',
    hot: true,
    before: (app) => {
      /*
       * 编辑器类型 :此处的指令表示的时各个各个编辑器在cmd或terminal中的命令
       * webstorm
       * code // vscode
       * idea
      */
      app.use('/__open-in-editor', launchEditorMiddleware('code'));
    }
  },
  performance: {
    hints: false
  },
  stats: {
    children: false
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(vue|jsx?)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(),
        exclude: config.jsexclude,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
        loader: 'url-loader',
        // todo: 这种写法有待调整
        query: {
          limit: 10000,
          name: path.posix.join('static', '[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: './index.html'
    }),
    // new CopyWebpackPlugin([
    //   { from: 'examples/versions.json' }
    // ]),
    new ProgressBarPlugin(),
    new VueLoaderPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env.FAAS_ENV': JSON.stringify(process.env.FAAS_ENV)
    // }),
    new webpack.LoaderOptionsPlugin({
      vue: {
        compilerOptions: {
          preserveWhitespace: false
        }
      }
    })
  ],
  optimization: {
    minimizer: []
  },
  devtool: '#eval-source-map'
};

module.exports = webpackConfig;
