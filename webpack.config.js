const path = require('path');
const filename = (ext) => `[name].${ext}`;
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostcssPresetEnv = require('postcss-preset-env');
const AutoPrefixer = require("autoprefixer");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: './js/main.js',
  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: ''
  },
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, 'dist'),
    open: true,
    compress: true,
    hot: true,
    port: 3030
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html'
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/'),
          to: path.resolve(__dirname, 'dist/assets/')
        }
      ],
    }),
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      },      
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, 
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + '/';
              }
            }
          },
          'css-loader',                    
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: function () {
                  return [
                    AutoPrefixer(),
                    PostcssPresetEnv()
                  ]
                }
              }              
            }
          },
          'sass-loader'          
        ],
      },
      {
        test: /\.js$/,
        exclude: /node-modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(?:|gif|jpg|jpeg|png|svg|webp|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: `./img/${filename('[ext]')}`
        },
      },
      {
        test: /\.(?:|woff2|woff)$/,
        type: 'asset/resource',
        generator: {
          filename: `./fonts/${filename('[ext]')}`
        },
      },
    ]
  }
}