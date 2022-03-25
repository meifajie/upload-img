module.exports = {
    runtimeCompiler: true,
    publicPath: '/', // 设置打包文件相对路径    
    outputDir: "dist",
    assetsDir: "static/wapUpload",

    // 开启源码地图 true 会打包源码
    productionSourceMap: false,

    pages: {
        index: {
            entry: "src/main.js",
            template: "public/index.html",
            filename: "index.html",
            minify: {
                removeComments: true,
                collapseWhitespace: false,
                removeAttributeQuotes: false
            },
        }
    },    
    
  }