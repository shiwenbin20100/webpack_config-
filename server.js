const webpack = require("webpack");
const path = require("path");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("./webpack.config");

let app = new (require("express"))();

let port = 9090;

// config.entry.unshift("webpack-hot-middleware/client?reload=true");


let compiler = webpack(config);



app.use( webpackDevMiddleware(compiler,{
    /*
    * 1.监听资源变更并自动打包
    * 2.打包到内存，速度较快
    * 3.支持热重载(HMR)
    */ 
    publicPath: "/assets/",//同webpack.config内的同名属性，但优先级更高
    headers: { "X-Custom-Header": "yes" },//定制HTTP头
    // index: false, //web服务器的索引路径，默认"index.html",如果是一个非undefined且会被转换为false的值，服务器将不会响应对根URL的请求
    lazy:false,//当true时，只有在浏览器主动请求时才会更新
    watchOptions: {
        aggregateTimeout: 300//rebuild前的延迟时间
      }
}) );

app.use( webpackHotMiddleware(compiler) );

app.get("/*",(req,res)=> res.sendFile(path.resolve(__dirname,"src/index.html")));

app.listen(port,(error)=>{
    if(!error){
        console.log("good")
    }
});