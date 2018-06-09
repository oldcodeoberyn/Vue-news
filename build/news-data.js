var models = require('./db')
var mysql = require('mysql')
// to be improved
var conn = mysql.createConnection(models.mysql)
conn.connect()

module.exports = {

  newsdata: {status: '0', msg: 'ok', result: {"channel": "区块链新闻", "num": "30", "list": []}},

  getNewsData: function () {
    let result = {status: '0', msg: 'ok', result: {"channel": "区块链新闻", "num": "30", "list": []}}
    conn.query("SELECT * FROM test.bit_news order by time desc limit 30", function (error, results) {
      if (error) throw error;
      for (var i = 0; i < results.length; i++) {
        let item = {}
        item['title'] = results[i]['title'];
        item['time'] = results[i]['time'];
        item['src'] = '';
        item['category'] = '';
        item['pic'] = '';
        item['content'] = results[i]['content'];
        result.result.list.push(item)
      }
    })

    return result;
  },

  init: function () {

    try {
      this.newsdata = this.getNewsData();
    } catch (e) {
      console.log(e)
      console.log("init failure")
    }
  },

  intervalUpdate: function () {
    setInterval(function () {
      try {
        this.newsdata = this.getNewsData();
      } catch (e) {
        console.log("intervalUpdate failure")
      }
    }, 1000 * 60 * 15)
  }

}
