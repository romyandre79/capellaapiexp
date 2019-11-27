'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,c.widgetname,c.widgettitle,b.groupname,d.menuname ";
var sqlfrom =
    "FROM userdash a "+
    "left join groupaccess b on b.groupaccessid = a.groupaccessid "+
    "left join widget c on c.widgetid = a.widgetid "+
    "left join menuaccess d on d.menuaccessid = a.menuaccessid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.userdashid,'') like ? "+
    " and coalesce(b.groupname,'') like ? "+
    " and coalesce(c.widgetname,'') like ? "+
    " and coalesce(d.menuname,'') like ? ";
var sqlwherecombo = " where coalesce(a.userdashid,'') like ? "+
    " or coalesce(b.groupname,'') like ? "+
    " or coalesce(c.widgetname,'') like ? "+
    " or coalesce(d.menuname,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("User Dashboard API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		userdashid = helper.getsearchtext(req.body.userdashid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		widgetname = helper.getsearchtext(req.body.widgetname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and userdashid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[userdashid,groupname,widgetname,menuname],
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
        userdashid = helper.getsearchtext(req.body.userdashid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		widgetname = helper.getsearchtext(req.body.widgetname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [userdashid,groupname,widgetname,menuname];
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
		userdashid = helper.getsearchtext(req.body.userdashid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		widgetname = helper.getsearchtext(req.body.widgetname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[userdashid,groupname,widgetname,menuname],
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
			var sqlq = sqlselect + sqlfrom + " where a.userdashid = ?";
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
	userdashid = req.body.userdashid,
	groupaccessid = req.body.groupaccessid,
	widgetid = req.body.widgetid,
	menuaccessid = req.body.menuaccessid,
	webformat = req.body.webformat,
    dashgroup = req.body.dashgroup,
    position = req.body.position,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[widgetid,'emptywidget','required'],
				[menuaccessid,'emptymenuaccess','required'],
				[groupaccessid,'emptygroupaccess','required'],
				[position,'emptyposition','required'],
				[webformat,'emptywebformat','required'],
				[dashgroup,'emptydashgroup','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [groupaccessid,widgetid,menuaccessid,position,webformat,dashgroup,datauser];
						if ((userdashid == null) || (userdashid == '')) {
							var sql = 'call Insertuserdash(?,?,?,?,?,?,?)';
						} else {
							var sql = 'call Updateuserdash(?,?,?,?,?,?,?,?)';
							sqlarray = [userdashid].concat(sqlarray);
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
				[id,'emptyuserdashid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeuserdash(?,?)';
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