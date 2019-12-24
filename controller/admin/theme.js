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
	"FROM theme a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.themeid,'') like ? "+
    " and coalesce(a.themename,'') like ? "+
    " and coalesce(a.description,'') like ? "+
    " and coalesce(a.themeprev,'') like ? ";
var sqlwherecombo = " where coalesce(a.themeid,'') like ? "+
    " or coalesce(a.themename,'') like ? "+
    " or coalesce(a.description,'') like ? "+
    " or coalesce(a.themeprev,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Theme API Index");
}

exports.listalluser = async function(req, res) {
	var sqlq = sqlselect + sqlfrom + ' where recordstatus = 1';
	connection.query(sqlq,
		'',
		function (error, rows, fields){
			if (error) {
				helper.getmessage(true, error.message,res);
			} else {
				result['total'] = rows.length;
				result['rows'] = rows;
				response.senddata(result['total'],result.rows,res);
			}
	});	
};

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		themeid = helper.getsearchtext(req.body.themeid,'','string'),
		themename = helper.getsearchtext(req.body.themename,'','string'),
		themeprev = helper.getsearchtext(req.body.themeprev,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and themeid in ("+id+")";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[themeid,themename,description,themeprev,sort],
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
        themeid = helper.getsearchtext(req.body.themeid,'','string'),
		themename = helper.getsearchtext(req.body.themename,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		themeprev = helper.getsearchtext(req.body.themeprev,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [themeid,themename,description,themeprev];
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
					sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort + sqloffset;	
					wherearray.push(offset,rowsn);
					connection.query(sqlq,
						wherearray,
						function (error, rows, fields){
							result.rows = rows;
							if (error) {
								helper.getmessage(true,error.message,res);
							} else {
								response.senddata(result['total'],result.rows,res);
							}
						});
				});
		}
	});	
};

exports.listcombo = async function(req, res) {
	var token = req.body.token,
		themeid = helper.getsearchtext(req.body.themeid,'','string'),
		themename = helper.getsearchtext(req.body.themename,'','string'),
		themeprev = helper.getsearchtext(req.body.themeprev,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[themeid,themename,description,themeprev],
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

exports.one = async function(req, res) {
	var id = req.body.id,
		token = req.body.token;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + " where a.themeid = ?";
			connection.query(sqlq,
			[ id ], 
			function (error, rows, fields){
				if (error) {
					helper.getmessage(true,error.message,res);
				} else {
					response.senddata(rows.length,rows,res);
				}
			});
		}
	});
};

exports.save = async function(req, res) {
	var token = req.body.token,
	themeid = req.body.themeid,
	themename = req.body.themename,
	description = req.body.description,
	themeprev = req.body.themeprev,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[themename,'emptythemename','required'],
				[description,'emptydescription','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [themename,description,themeprev,recordstatus,datauser];
						if ((themeid == null) || (themeid == '')) {
							var sql = 'call Inserttheme(?,?,?,?,?)';
						} else {
							var sql = 'call Updatetheme(?,?,?,?,?,?)';
							sqlarray = [themeid].concat(sqlarray);
						}
						connection.query(sql,
						sqlarray, 
						function (error, rows, fields){
							if (error) {
								helper.getmessage(true,error.message,res);
							} else {
								helper.getmessage(false,'alreadysaved',res);
							}
						});
					}
				}
			);
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
				[id,'emptythemeid','required'],
				[id,'themeidnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgetheme(?,?)';
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