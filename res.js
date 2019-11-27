'use strict';
var log = require('./config/logger');
exports.ok = function(values, res) {
  var data = {
		'iserror':0,
    'msg':values,
    'total':0,
    'rows':null
  };
  res.json(data);
  res.end();
};
exports.error = function(values, res) {
  var data = {
		'iserror':1,
    'msg':values,
    'total':0,
    'rows':null
  };
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
	log.error(data);
  res.json(data);
  res.end();
};