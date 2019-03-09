const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  target: "web",
  devtool: "inline-source-map",
  entry: path.join(__dirname, "src/index.ts"),
  output: {
    filename: "client.js",
    path: path.join(__dirname, "build/")
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules", "../shared"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  plugins: [new Dotenv({
    path: "./.env.local"
  })],
  devServer: {
    contentBase: path.join(__dirname, "build"),
    port: 8088
  }
};