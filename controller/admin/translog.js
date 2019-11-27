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
	"FROM translog a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.translogid,'') like ? "+
	" and coalesce(a.username,'') like ? "+
	" and coalesce(a.createddate,'') like ? "+
	" and coalesce(a.useraction,'') like ? "+
	" and coalesce(a.newdata,'') like ? "+
	" and coalesce(a.olddata,'') like ? "+
	" and coalesce(a.menuname,'') like ? "+
	" and coalesce(a.tableid,'') like ? ";
var sqlwherecombo = " where coalesce(a.translogid,'') like ? "+
	" or coalesce(a.username,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Transaction Log API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		translogid = helper.getsearchtext(req.body.translogid,'','string'),
		username = helper.getsearchtext(req.body.username,'','string'),
		createddate = helper.getsearchtext(req.body.createddate,'','string'),
		useraction = helper.getsearchtext(req.body.useraction,'','string'),
		newdata = helper.getsearchtext(req.body.newdata,'','string'),
		olddata = helper.getsearchtext(req.body.olddata,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		tableid = helper.getsearchtext(req.body.tableid,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and translogid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[translogid,username,createddate,useraction,newdata,olddata,menuname,tableid],
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
		translogid = helper.getsearchtext(req.body.translogid,'','string'),
		username = helper.getsearchtext(req.body.username,'','string'),
		createddate = helper.getsearchtext(req.body.createddate,'','string'),
		useraction = helper.getsearchtext(req.body.useraction,'','string'),
		newdata = helper.getsearchtext(req.body.newdata,'','string'),
		olddata = helper.getsearchtext(req.body.olddata,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		tableid = helper.getsearchtext(req.body.tableid,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [translogid,username,createddate,useraction,newdata,olddata,menuname,tableid];
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

exports.purge = async function(req, res) {
	var token = req.body.token,
	id = req.body.id,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[id,'emptytranslogid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgetranslog(?,?)';
						connection.query(sql,
						[ id, datauser ], 
						function (error, rows, fields){
							if (error) {
								helper.getmessage(true,error.message,res);
							} else {
								helper.getmessage(false,'alreadypurge',res);
							}
						});
					}
				}
			);
		}
	});
};