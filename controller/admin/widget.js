'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,b.modulename ";
var sqlfrom =
    "FROM widget a "+
    "left join modules b on b.moduleid = a.moduleid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.widgetid,'') like ? "+
    " and coalesce(a.widgetname,'') like ? "+
    " and coalesce(a.widgettitle,'') like ? ";
var sqlwherecombo = " where coalesce(a.widgetid,'') like ? "+
    " or coalesce(a.widgetname,'') like ? "+
    " or coalesce(a.widgettitle,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Widget API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		widgetid = helper.getsearchtext(req.body.widgetid,'','string'),
		widgetname = helper.getsearchtext(req.body.widgetname,'','string'),
		widgettitle = helper.getsearchtext(req.body.widgettitle,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and widgetid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[widgetid,widgetname,widgettitle],
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
        widgetid = helper.getsearchtext(req.body.widgetid,'','string'),
		widgetname = helper.getsearchtext(req.body.widgetname,'','string'),
		widgettitle = helper.getsearchtext(req.body.widgettitle,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [widgetid,widgetname,widgettitle];
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

exports.listcombo = async function(req, res) {
	var token = req.body.token,
		widgetid = helper.getsearchtext(req.body.widgetid,'','string'),
		widgetname = helper.getsearchtext(req.body.widgetname,'','string'),
		widgettitle = helper.getsearchtext(req.body.widgettitle,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[widgetid,widgetname,widgettitle],
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
			var sqlq = sqlselect + sqlfrom + " where a.widgetid = ?";
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
	widgetid = req.body.widgetid,
	widgetname = req.body.widgetname,
	widgettitle = req.body.widgettitle,
	widgetversion = req.body.widgetversion,
	widgetby = req.body.widgetby,
	description = req.body.description,
	widgeturl = req.body.widgeturl,
	moduleid = req.body.moduleid,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[widgetname,'emptywidgetname','required'],
				[widgettitle,'emptywidgettitle','required'],
				[widgetversion,'emptywidgetversion','required'],
				[widgetby,'emptywidgetby','required'],
				[description,'emptydescription','required'],
				[widgeturl,'emptywidgeturl','required'],
				[moduleid,'emptymodule','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [widgetname,widgettitle,widgetversion,widgetby,description,widgeturl,moduleid,recordstatus,datauser];
						if ((widgetid == null) || (widgetid == '')) {
							var sql = 'call Insertwidget(?,?,?,?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatewidget(?,?,?,?,?,?,?,?,?,?)';
							sqlarray = [widgetid].concat(sqlarray);
						}
						connection.query(sql,
						sqlarray, 
						function (error, rows, fields){
							if (error) {
								helper.getmessage(true,error,res);
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
				[id,'emptywidgetid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgewidget(?,?)';
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