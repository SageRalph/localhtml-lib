const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "localhtml.min.js",
    path: path.resolve(__dirname, "docs"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              attributes: { class: "lh-no-save" },
            },
          },
          { loader: "css-loader" },
        ],
      },
      {
        test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        use: ["base64-inline-loader"],
      },
    ],
  },
  plugins: [new CompressionPlugin()],
};
