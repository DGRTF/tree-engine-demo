import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

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
			new HtmlWebpackPlugin({
				template: './public/index.html',
			}),
		],
	};
};