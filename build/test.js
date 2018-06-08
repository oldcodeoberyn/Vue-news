/**
 * Created by caishichao on 2018/6/8.
 */

var mysql  = require('mysql');

var connection = mysql.createConnection({
  host     : '39.105.128.88',
  user     : 'root',
  password : '123456',
  port: '3306',
  database: 'test',
});

connection.connect();

var  sql = "SELECT * FROM test.bit_news order by time desc limit 30";
//查
connection.query(sql,function (err, result) {
  if(err){
    console.log('[SELECT ERROR] - ',err.message);
    return;
  }

  console.log('--------------------------SELECT----------------------------');
  console.log(result);
  console.log('------------------------------------------------------------\n\n');
});

connection.end();
