var mysql = require('mysql'),
 log = require('./logger');

var con = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "capellafive"
});
/*
con.connect(function (err){
    if(err) log.error(err);
});
*/
module.exports = con;