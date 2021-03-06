const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const nodeExternals = require("webpack-node-externals");

const env = process.argv[process.argv.length - 1]
console.log(env) 

const defaultPath = {
    src: path.resolve(__dirname,"./src")
}

module.exports = {
    mode:"development",
    entry:[
        "./src/app.js",
        "webpack-hot-middleware/client?reload=true"
    ],
    // entry:{
    //     app: "./src/app.js",
    //     vendor: ["./src/components/bpp.js"]//需要作为vendor块打包的文件
    // },
    target:"web",//告诉webpack当前运行的环境，"node"代表nodejs环境,如文件采用require方式引用
    output: {
        filename: env==="production"?"js/[name]_[hash:8].js":"app.js",
        // filename: "app.js",
        path:path.resolve(__dirname,"./dist/assets"),//打包及发布出来的文件路径
        publicPath: "/assets/",//打包后的资源的引用路径=publicPath+资源名
        chunkFilename:'js/[name]_[chunkhash:8].chunk.js',//用于打包按需加载的文件
        libraryTarget: 'var'//告诉webpack使用什么样的规范,常用的有
                            //1."commonjs2":用于node环境,即打包后的文件内会以module.exports={}的形式来组织代码
                            //2."umd"用umd的模块化写法
    },
    module: {
        // noParse: (content) => {
            /**
             * 不会解析满足条件的文件中的依赖关系
             * 因此noParse的文件中不应有import,require,define的调用
             */
            // return /rxjs/.test(content);
        // },
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader"],
                include:[
                    path.resolve(__dirname,"../src")
                ]
            },
            {
                test: /\.css$/,
                use: [
                    env==="production"?MiniCssExtractPlugin.loader:"style-loader",
                    "css-loader",
                    "postcss-loader"
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: ["url-loader?limit=8192"]
            },
            {
                test: /\.(mp4|ogg|svg)/,
                use: ["file-loader"]
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: ["url-loader?limit=10000&mimetype=application/font-woff"]
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: ["url-loader?limit=10000&mimetype=application/octet-stream"]
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: ["file-loader"]
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: ["url-loader?limit=10000&mimetype=application/image/svg+xml"]
            },
            {
                test: /\.scss$/,
                use: [
                    env==="production"?"style-loader":MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            module: true,
                            localIdentName: "[local]--[hash:base64:8]"
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },

        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),//HMR
        new HtmlWebpackPlugin({
            title:"123123",
            filename: "index.html",
            template: "./src/index.html",//模版文件,非html的模版文件要安装对应loader
            inject: true,//默认值为true，即script标签位于body底部;"head"表示插入到head标签内,false表示不插入
            favicon: "",//制定模版内shortcut icon的路径
            meta: {},//指定插入文档的meta标签,如viewport相关配置
            minify:false,//是否对html文档进行压缩,选项见html-minifier文档
            hash: false,//默认false，为true时会给所有编译的js和css文件一个hash值,以此来让缓存失效
            cache:true,//默认为true,即只有文件变化时才会生成文件
            // chunks:[],//指定要插入html文档的文件,默认会将所有生成的js和css文件放入html文档
            chunksSortMode:"auto",//默认值是"auto“;"dependency"=>按照依赖排列;"none"=>乱序排列;或者可以是一个函数:function(a,b){return a.names[0] - b.names[0]}用法同数组的sort方法
            excludeChunks:false//chunk选项的反义,即排除哪些文件
        }),
        new webpack.ProvidePlugin({
            /**
             * 自动加载模块,这样在文件中就不需要再用import或require来引入模块,webpack会自动找到对应模块
             */
            $: "jquery",
            jQuery: "jquery",
            React: "react"
        }),
        new ManifestPlugin({
            /**
             * webpack打包后会生成一个文件,用key/value记录打包前和打包后文件名的映射关系
             */
            fileName: "aaa.json",//生成的文件名,默认是"manifest.json"
            publicPath: "/public",//会添加到生成的文件的value路径前
            basePath: "/haha"//同publicPath,但加到key前
        }),
        new MiniCssExtractPlugin({
            //打包css文件
            filename: env==="production"?"css/[name]_[hash:8].css":"[name].css",
            chunkFilename: env==="production"?"css/[id]_[hash:8].css":"[id].css"
          })
    ],
    optimization: {
        splitChunks: {
            //配置需要单独打包的块
            chunks: "async",//"initial"=>打包初始块;"async"=>打包按需加载的块;"all"=>打包所有块

            //webpack默认根据以下四个条件进行打包
            minSize: 30000,//每个块的最小大小
            minChunks: 2,//模块被至少2个其他文件引用
            maxAsyncRequests: 5,//被按需加载的最大次数
            maxInitialRequests: 3,//加载初始页面时的最大请求次数

            automaticNameDelimiter: '~',//块名与文件名中间的分隔符,如"vendor~app.js"
            name: true,
            cacheGroups: {
                /**
                 * 单独配置要拆分出来的块,除了test,priority,reuseExistingChunk外其他属性可继承自splitChunks.
                 */
                vendor: {
                    test: "vendor",//要打包的chunk文件名,可以在entry中定义;或者也可以是正则表达式，指定要包括的文件路径
                    chunks: "initial",
                    name: "vendor",//生成的块的名字
                    enforce: true,//为true时,表示忽略minSize,minChunks等4个默认值并总是生成新的块
                    priority: -20,//这一缓存组的优先级
                    reuseExistingChunk: true//设置是否需要重用已经存在的块
                },
                default: false//可以配置块的默认设置
            }
        },
        runtimeChunk: true,//设置为true时，会给每一个入口文件都生成一个额外的只包含运行时代码的文件
        minimizer: [
            /**
             * webpack4 production模式下默认会压缩JS
             * 以下为自定义配置
             */
            new UglifyJsPlugin({
                test:/\.js$/i,//需要压缩的文件
                include:undefined,//要包括的文件
                exclude:undefined,//要排除的文件
                cache: true,//开启文件缓存,默认false
                parallel: true,//并行运行,提升速度,默认false
                sourceMap: true,//是否生成SourceMap
            }),
            new OptimizeCSSAssetsPlugin({
                //用于压缩CSS
                cssProcessor: require('cssnano'),//用于优化|压缩CSS的处理器,默认使用cssnano
                cssProcessorOptions: { 
                    //cssnano具体可配置内容见
                    //http://cssnano.co/optimisations/
                    discardComments: { 
                        removeAll: true//移除所有注释
                    },
                    calc: {
                        /**
                         * 把css内的calc()转化为实际值
                         * 例：height:calc(100px * 2) => height(200px)
                         */
                        precision: 5 //小数精度
                    }
                },
                canPrint: true //是否允许往控制台中打印内容
            })
        ]
    },
    resolve: {
        alias: {
            /**
             * 用key作为value的别名,在import/require时会更快
             * 例：原本需要import app from "../../x/y/src/app"
             *     现在import app from "src/app"
             */
            src: defaultPath.src
        },
        modules: [
            /**
             * webpack解析模块时去搜索的目录,会按照从上到下的顺序去寻找文件
             */
            "node_modules",
            defaultPath.src
        ],
        extensions: [".js",".tsx"]//导入模块时可以忽略后缀名
    },
    devServer: {
        historyApiFallback: true
    },
    externals: [{
        /**
         * 如果希望从如cdn等地方引入外部模块,可以设置external来使webpack不打包指定内容
         */
        // jquery: "jQuery"//意思是:当require("jquery")时，你就会得到一个全局变量"jQuery"
    },
    // nodeExternals() //用于构建后端应用，不写参数表示不打包所有node_modules目录下的文件
    ]
}