const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		mainFields: ["main", "module", "browser"],
	},
	entry: "./src/app.tsx",
	target: "electron-renderer",
	// target: 'web',
	devtool: "source-map",

	devServer: {
		contentBase: path.join(__dirname, "../dist/renderer"),
		historyApiFallback: true,
		compress: true,
		hot: true,
		port: 4000,
		publicPath: "/",
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "js/[name].js",
	},
	resolve: {
		alias: {},
		symlinks: false,
		extensions: [".js", ".jsx", ".ts", ".tsx"]
	},
	module: {
		// strictExportPresence: true,
		rules: [
			{
				test: /\.(jpe?g|png|gif)(\?.+)?$/,
				loader: "url-loader"
			},
			{
				test: /\.(js|mjs|jsx|ts|tsx)$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							cacheDirectory: true,
							presets: [
								["@babel/preset-react"],
								["@babel/preset-env"]
							],
							plugins: [
								"@babel/plugin-proposal-class-properties",
								"@babel/plugin-transform-runtime",
								[
									"import", {
										"libraryName": "antd",
										"libraryDirectory": "es",
										"style": "css"
									}
								]
							]
						}
					},
					{
						loader: "ts-loader",
						options: {	
							happyPackMode: true,
							transpileOnly: true
							
						}
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"]
			},
			{
				test: /\.less$/,
				use: ["style-loader", "css-loader", "less-loader"]
			},
			{
				test: /\.md$/,
				loader: "raw-loader"
			},
			{
				loader: require.resolve("file-loader"),
				exclude: [
					/\.(js|mjs|jsx|ts|tsx)$/,
					/\.html$/,
					/\.json$/,
					/\.css$/,
					/\.less$/,
					/\.md$/
				]
			}
		]
	},
	plugins: [
		// new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: path.join(__dirname,'../', 'src/template.html'),
		}),
		new MiniCssExtractPlugin({
			filename: "[chunkhash:12].css"
		}),	
		
	]
};
