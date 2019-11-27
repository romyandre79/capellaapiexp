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
	"FROM modules a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.moduleid,'') like ? "+
    " and coalesce(a.modulename,'') like ? "+
    " and coalesce(a.moduledesc,'') like ? "+
    " and coalesce(a.moduleicon,'') like ? ";
var sqlwherecombo = " where coalesce(a.moduleid,'') like ? "+
    " or coalesce(a.modulename,'') like ? "+
    " or coalesce(a.moduledesc,'') like ? "+
    " or coalesce(a.moduleicon,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Modules API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		moduleid = helper.getsearchtext(req.body.moduleid,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),
		moduledesc = helper.getsearchtext(req.body.moduledesc,'','string'),
		moduleicon = helper.getsearchtext(req.body.moduleicon,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and moduleid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[moduleid,modulename,moduledesc,moduleicon],
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
        moduleid = helper.getsearchtext(req.body.moduleid,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),
		moduledesc = helper.getsearchtext(req.body.moduledesc,'','string'),
		moduleicon = helper.getsearchtext(req.body.moduleicon,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [moduleid,modulename,moduledesc,moduleicon];
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
							result.rows = rows;
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
		moduleid = helper.getsearchtext(req.body.moduleid,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),
		moduledesc = helper.getsearchtext(req.body.moduledesc,'','string'),
		moduleicon = helper.getsearchtext(req.body.moduleicon,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[moduleid,modulename,moduledesc,moduleicon],
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
			var sqlq = sqlselect + sqlfrom + " where a.moduleid = ?";
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
	moduleid = req.body.moduleid,
	modulename = req.body.modulename,
	moduledesc = req.body.moduledesc,
	moduleicon = req.body.moduleicon,
	isinstall = req.body.isinstall,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[modulename,'emptymodulename','required'],
				[moduledesc,'emptymoduledesc','required'],
				[moduleicon,'emptymoduleicon','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [modulename,moduledesc,moduleicon,isinstall,recordstatus,datauser];
						if ((moduleid == null) || (moduleid == '')) {
							var sql = 'call Insertmodules(?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatemodules(?,?,?,?,?,?,?)';
							sqlarray = [moduleid].concat(sqlarray);
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
				[id,'emptymoduleid','required'],
				[id,'moduleidnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgemodules(?,?)';
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