'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,b.languagename ";
var sqlfrom =
    "FROM catalogsys a "+
    "left join language b on b.languageid = a.languageid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.catalogsysid,'') like ? "+
    " and coalesce(b.languagename,'') like ? "+
    " and coalesce(a.catalogname,'') like ? "+
    " and coalesce(a.catalogval,'') like ? ";
var sqlwherecombo = " where coalesce(a.catalogsysid,'') like ? "+
    " or coalesce(b.languagename,'') like ? "+
    " or coalesce(a.catalogname,'') like ? "+
    " or coalesce(a.catalogval,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Catalog System API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		catalogsysid = helper.getsearchtext(req.body.catalogsysid,'','string'),
		catalogname = helper.getsearchtext(req.body.catalogname,'','string'),
		languagename = helper.getsearchtext(req.body.languagename,'','string'),
		catalogval = helper.getsearchtext(req.body.catalogval,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and catalogsysid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[catalogsysid,languagename,catalogname,catalogval],
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
        catalogsysid = helper.getsearchtext(req.body.catalogsysid,'','string'),
		catalogname = helper.getsearchtext(req.body.catalogname,'','string'),
		languagename = helper.getsearchtext(req.body.languagename,'','string'),
		catalogval = helper.getsearchtext(req.body.catalogval,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [catalogsysid,languagename,catalogname,catalogval];
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
		catalogsysid = helper.getsearchtext(req.body.catalogsysid,'','string'),
		catalogname = helper.getsearchtext(req.body.catalogname,'','string'),
		catalogval = helper.getsearchtext(req.body.catalogval,'','string'),
		languagename = helper.getsearchtext(req.body.languagename,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[catalogsysid,languagename,catalogname,catalogval],
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
			var sqlq = sqlselect + sqlfrom + " where a.catalogsysid = ?";
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
	catalogsysid = req.body.catalogsysid,
	catalogname = req.body.catalogname,
	languageid = req.body.languageid,
	catalogval = req.body.catalogval,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[catalogname,'emptycatalogname','required'],
				[catalogval,'emptycatalogval','required'],
				[languageid,'emptylanguage','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [languageid,catalogname,catalogval,datauser];
						if ((catalogsysid == null) || (catalogsysid == '')) {
							var sql = 'call Insertcatalogsys(?,?,?,?)';
						} else {
							var sql = 'call Updatecatalogsys(?,?,?,?,?)';
							sqlarray = [catalogsysid].concat(sqlarray);
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
				[id,'emptycatalogsysid','required'],
				[id,'catalogsysidnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgecatalogsys(?,?)';
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