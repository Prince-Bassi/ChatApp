import "dotenv/config";
import path from "path";
import {fileURLToPath} from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
       mode: process.env.NODE_ENV,
       entry: path.resolve(__dirname, "Scripts/script.jsx"),
       output: {
              path: path.resolve(__dirname, "ProjectFiles"),
              filename: "bundle.js",
              publicPath: "/",
       },
       module: {
              rules: [
              {
                     test: /\.(js|jsx)$/,
                     exclude: /node_modules/,
                     use: {
                            loader: "babel-loader",
                            options: {
                                   presets: ['@babel/preset-env', '@babel/preset-react'],
                                   cacheDirectory: true,
                            },
                     },
              },
              {
                     test: /\.(sa|sc|c)ss$/,
                     use: [
                            'style-loader',
                            'css-loader',
                            'sass-loader',
                     ],
              },
              ],
       },
       resolve: {
              extensions: ['.js', '.jsx', ".scss"],
       },
       plugins: [
              new HtmlWebpackPlugin({
                     template: path.resolve(__dirname, 'ProjectFiles/index.html'),
              }),
       ],
       devtool: 'cheap-module-source-map',
       devServer: {
              static: path.join(__dirname, "ProjectFiles"),
              compress: true,
              hot: true,
              historyApiFallback: true,
              port: process.argv[2],
       },
};