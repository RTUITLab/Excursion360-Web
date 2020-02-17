const path = require("path");
const Dotenv = require("dotenv-webpack");



module.exports = function (env, argv) {
  return {
    target: "web",
    devtool: "source-map",
    context: path.resolve(__dirname, "src"),
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
      host: "0.0.0.0",
      port: 8088
    }
  };
}