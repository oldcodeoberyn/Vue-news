require('./check-versions')()
var models = require('./db')
var mysql = require('mysql')
var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var http = require('http')




// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var apiRoutes = express.Router()
apiRoutes.get('/channel', function(req, res) {
  // let channel = ''
  // let url = encodeURI('http://api.jisuapi.com/news/channel?appkey=ca05a06b9221f5d1')
  // let getChannel = new Promise((resolve, reject) => {
  //   http.get(url, response => {
  //     response.on('data', data => {
  //       channel += data
  //     })
  //     response.on('end', () => {
  //       resolve(channel)
  //     })
  //   })
  // })
  // getChannel.then(channel => {
  //   channel = JSON.parse(channel)
  //   console.log(channel)
  //   res.json(channel)
  // })
  res.json( {status: '0', msg: 'ok', result:['区块链新闻','市场行情', '丑哥动态']})
})
apiRoutes.get('/channel/:item', function(req, res) {
  let item = req.params.item
  function findChannel(item) {
    return new Promise((resolve, reject) => {
      let findResult = ''
      // console.log("######", item)
      // let url = encodeURI('http://api.jisuapi.com/news/get?channel='+item+'&start=0&num=30&appkey=ca05a06b9221f5d1')
      // console.log("######", url)
      // http.get(url, response => {
      //   response.on('data', data => {
      //     findResult += data
      //   })
      //   response.on('end', () => {
      //     resolve(findResult)
      //   })
      // })
      let conn = mysql.createConnection(models.mysql)
      conn.connect();
      let result = {status: '0', msg: 'ok', result:{"channel":"区块链新闻", "num": "30", "list":[]}}
      conn.query("SELECT * FROM test.bit_news order by url desc limit 30", function (error, results) {
        if (error) throw error;
        for (var i = 0; i < results.length; i++)
        {
          let item = {}
          item['title'] = results[i]['title'];
          item['time'] = results[i]['time'];
          item['src'] = '';
          item['category'] = '';
          item['pic'] ='';
          item['content'] = results[i]['content'];
          console.log(item);
          result.result.list.push(item)
        }
        console.log(result);
        resolve(result);
      });

      conn.end();

    })
  }
  findChannel(item)
    .then(findResult => {
      console.log("I am here")
      // res.json(JSON.parse(findResult))
      res.json(findResult)
    })
})
apiRoutes.get('/search/:keywords', function(req, res) {
  let keywords = req.params.keywords
  function search(keywords) {
    return new Promise((resolve, reject) => {
      let searchResult = ''
      let url = encodeURI('http://api.jisuapi.com/news/search?keyword='+keywords+'&appkey=ca05a06b9221f5d1')
      http.get(url, response => {
        response.on('data', data => {
          searchResult += data
        })
        response.on('end', () => {
          resolve(searchResult)
        })
      })
    })
  }
  search(keywords)
    .then(searchResult => {
      res.json(JSON.parse(searchResult))
    })
})
app.use('/api', apiRoutes)

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
