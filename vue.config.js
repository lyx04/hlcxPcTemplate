const CompressionWebpackPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
let path = require("path");
const productionGzipExtensions = ["js", "css"];
const isProduction = process.env.NODE_ENV;
function resolve(dir) {
  return path.join(__dirname, dir);
}
let timeStamp = new Date().getTime();

module.exports = {
  publicPath: "/{{name}}/",
  outputDir: "{{name}}",
  assetsDir: "static",
  filenameHashing: false,
  productionSourceMap: false, // 关闭生产环境的 source map
  devServer: {
    // host: "192.168.31.122",
    port: 80, // 端口号
    https: false, // https:{type:Boolean}
    open: true, //配置自动启动浏览器
    hotOnly: true,
    disableHostCheck: true,
  },
  css: {
    extract: {
      // 打包后css文件名称添加时间戳
      filename: `css/[name].${timeStamp}.css`,
      chunkFilename: `css/[name].${timeStamp}.css`,
    },
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "sass",
      patterns: [],
    },
  },
  chainWebpack: (config) => {
    config.resolve.alias.set("@", resolve("src")); // key,value自行定义，比如.set('@@', resolve('src/components'))
    //打包配置时间戳
    if (isProduction != "local") {
      // 给js和css配置版本号
      config.output.filename("js/[name]." + timeStamp + ".js").end();
      config.output.chunkFilename("js/[name]." + timeStamp + ".js").end();
    }
    config.plugins.delete("prefetch");
    config.plugins.delete("preload");
  },
  configureWebpack: (config) => {
    const plugins = [];
    config.externals = {
      vue: "Vue",
      Vuex: "Vuex",
      "vue-router": "VueRouter",
      axios: "axios",
      AMap: "AMap",
      "element-ui": "ELEMENT"
    };
    if (isProduction != "local") {
      plugins.push(
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
          threshold: 4096,
          minRatio: 0.5,
        })
      );
      plugins.push(
        new TerserPlugin({
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ["console.log"], // 移除console
            },
          },
        })
      );

      config.plugins = [...config.plugins, ...plugins];
    }
  },
};
