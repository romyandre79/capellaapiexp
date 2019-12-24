'use strict';
var log = require('./config/logger');
exports.sendmsg = function(iserror,values, res) {
  var data = {
		'iserror':iserror,
    'msg':values,
  };
  log.info(data);
  res.json(data);
  res.end();
};
exports.senddata = function(total,rows, res) {
  var data = {
    'iserror':0,
    'total':total,
		'msg':'Success',
    'rows':rows
  };
  log.info(data);
  res.json(data);
  res.end();
};