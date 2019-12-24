'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.menuaccessid,a.menuname,a.description,a.menuurl,a.menuicon,a.parentid,a.moduleid,a.sortorder,a.menucode,a.menudep,a.isgen,a.recordstatus,a.createddate,b.menuname as parentname,c.modulename,b.description as parentdesc ";
var sqlfrom =
    "FROM menuaccess a "+
    "left join menuaccess b on a.parentid = b.menuaccessid "+
    "left join modules c on c.moduleid = a.moduleid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.menuaccessid,'') like ? "+
    " and coalesce(a.menuname,'') like ? "+
    " and coalesce(a.description,'') like ?"+
    " and coalesce(a.menuurl,'') like ? "+
    " and coalesce(b.menuname,'') like ? "+
    " and coalesce(c.modulename,'') like ?";
var sqlwherecombo = " where coalesce(a.menuaccessid,'') like ? "+
    " or coalesce(a.menuname,'') like ? "+
    " or coalesce(a.description,'') like ?"+
    " or coalesce(a.menuurl,'') like ? "+
    " or coalesce(b.menuname,'') like ? "+
    " or coalesce(c.modulename,'') like ?";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Menu Access API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		menuaccessid = helper.getsearchtext(req.body.menuaccessid,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		menuurl = helper.getsearchtext(req.body.menuurl,'','string'),
		parentname = helper.getsearchtext(req.body.parentname,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and a.menuaccessid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[menuaccessid,menuname,description,menuurl,parentname,modulename],
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
        menuaccessid = helper.getsearchtext(req.body.menuaccessid,'','string'),
        menuname = helper.getsearchtext(req.body.menuname,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		menuurl = helper.getsearchtext(req.body.menuurl,'','string'),
		parentname = helper.getsearchtext(req.body.parentname,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),        
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [menuaccessid,menuname,description,menuurl,parentname,modulename];
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
		menuaccessid = helper.getsearchtext(req.body.menuaccessid,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		menuurl = helper.getsearchtext(req.body.menuurl,'','string'),
		parentname = helper.getsearchtext(req.body.parentname,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),        
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[menuaccessid,menuname,description,menuurl,parentname,modulename],
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
			var sqlq = sqlselect + sqlfrom + " where a.menuaccessid = ?";
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
	menuaccessid = req.body.menuaccessid,
	menuname = req.body.menuname,
	description = req.body.description,
	menuurl = req.body.menuurl,
	menuicon = req.body.menuicon,
	parentid = req.body.parentid,
	moduleid = req.body.moduleid,
	sortorder = req.body.sortorder,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[menuname,'emptymenuname','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [menuname,description,menuurl,menuicon,parentid,moduleid,sortorder,recordstatus,datauser];
						if ((menuaccessid == null) || (menuaccessid == '')) {
							var sql = 'call Insertmenuaccess(?,?,?,?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatemenuaccess(?,?,?,?,?,?,?,?,?,?)';
							sqlarray = [menuaccessid].concat(sqlarray);
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
				[id,'emptymenuaccessid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgemenuaccess(?,?)';
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