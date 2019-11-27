'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.* ";
var sqlfrom =
	"FROM productstock a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.productstockid,'') like ? "+
	" and coalesce(a.productname,'') like ? "+
	" and coalesce(a.sloccode,'') like ? "+
	" and coalesce(a.storagedesc,'') like ? "+
	" and coalesce(a.uomcode,'') like ? ";
var sqlwherecombo = " where coalesce(a.productstockid,'') like ? "+
	" or coalesce(a.productname,'') like ? "+
	" or coalesce(a.sloccode,'') like ? "+
	" or coalesce(a.storagedesc,'') like ? "+
	" or coalesce(a.uomcode,'') like ? ";	
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Material Stock Overview API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		productstockid = helper.getsearchtext(req.body.productstockid,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		sloccode = helper.getsearchtext(req.body.sloccode,'','string'),
		storagedesc = helper.getsearchtext(req.body.storagedesc,'','string'),
		uomcode = helper.getsearchtext(req.body.uomcode,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and productstockid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[productstockid,productname,sloccode,storagedesc,uomcode],
				function (error, rows, fields){
					if (error) {
						helper.getmessage(true, error.message,res);
					} else {
						result['total'] = rows.length;
						result['rows'] = rows;
						response.senddata(result['total'],result.rows,res);
					}
			});	
		}
	});
};

exports.list = async function(req, res) {
    var token = req.body.token,
        productstockid = helper.getsearchtext(req.body.productstockid,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		sloccode = helper.getsearchtext(req.body.sloccode,'','string'),
		storagedesc = helper.getsearchtext(req.body.storagedesc,'','string'),
		uomcode = helper.getsearchtext(req.body.uomcode,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [productstockid,productname,sloccode,storagedesc,uomcode];
			var sqlq = sqlcount + sqlfrom + sqlw;
			connection.query(sqlq,
				wherearray,
				function (error, rows, fields){
					if (error != undefined) {
						helper.getmessage(true,error.message,res);
					}
					result['total'] = rows[0]['total'];
					var offset = '';
					var sqloffset = '';
					helper.getoffset(page,rowsn,function(retoffset,retsqloffset){
						offset = retoffset;
						sqloffset = retsqloffset;
					});
					var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort + sqloffset;	
					wherearray.push(offset,rowsn);
					connection.query(sqlq,
						wherearray,
						function (error, rows, fields){
							result['rows'] = rows;
							if (error) {
								helper.getmessage(true,error.message,res);
							} else {
								response.senddata(result['total'],result['rows'],res);
							}
						});	
				});
				
		}
	});
};