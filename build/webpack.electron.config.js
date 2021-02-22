const path = require("path");

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devtool: "source-map",
  entry: "./electron/main.ts",
  target: "electron-main",
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        use: [
          // 'cache-loader',
          // 'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.(ts|tsx)?$/,
        use: [
          // 'cache-loader',
          // 'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              transpileOnly: true,
              configFile:'../tsconfig.electron.json'
            },
          },
        ],
      },


    ],
  },
  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(__dirname, '../',"dist"),
    filename: "[name].js",
  },
};
