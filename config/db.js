var mysql = require('mysql'),
 log = require('./logger');

var con = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "capella6"
});

module.exports = con;