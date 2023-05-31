import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rootDirectory = '';
let devTool = 'eval-source-map';

export default (env, options) => {
	if (options.mode === 'production') {
		rootDirectory = '';
		devTool = undefined;
	}

	return {
		target: 'web',
		entry: './src/index.tsx',
		devtool: devTool,
		// optimization: {
		// 	minimize: true,
		// 	minimizer: [
		// 		new TerserPlugin({
		// 			extractComments: false,
		// 		}),
		// 	],
		// },
		module: {
			rules: [
				{
					test: /\.(ts|tsx)$/,
					exclude: /(node_modules|bower_components)/,
					use: [
						'ts-loader',
					],
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				},
				// {
				// 	test: /\.(ttf|woff|woff2|eot)$/,
				// 	loader: 'file-loader',
				// 	options: {
				// 		name: '[name].[ext]',
				// 		outputPath: 'fonts',
				// 		publicPath: `${rootDirectory}/fonts`,
				// 	},
				// },
				// {
				// 	test: /\.(svg|jpeg|jpg)$/,
				// 	include: [path.join(__dirname, 'src/assets')],
				// 	loader: 'file-loader',
				// 	options: {
				// 		name: '[name].[ext]',
				// 		outputPath: 'img',
				// 		publicPath: `${rootDirectory}/img`,
				// 	},
				// },
			],
		},
		resolve: {
			extensions: ['.*', '.ts', '.tsx', '.js'],
		},
		output: {
			path: path.resolve(__dirname, 'dist/'),
			publicPath: rootDirectory,
			filename: 'bundle.js',
		},
		devServer: {
			static: {
				directory: path.join(__dirname, 'public'),
			},
			port: 3011,
			open: true,
		},
		plugins: [
			// new webpack.CleanPlugin(),
			// new Dotenv({
			// 	path: path.resolve(__dirname, `./.env.${options.mode}`),
			// }),
			new CopyPlugin({
				patterns: [
					{ from: "./src/data", to: "./data" },
				],
			}),
			new HtmlWebpackPlugin({
				template: './public/index.html',
			}),
		],
	};
};