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
    "FROM parameter a "+
    "left join modules b on b.moduleid = a.moduleid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.parameterid,'') like ? "+
    " and coalesce(a.paramname,'') like ? "+
    " and coalesce(a.paramvalue,'') like ? "+
    " and coalesce(a.description,'') like ? "+
    " and coalesce(b.modulename,'') like ? ";
var sqlwherecombo = " where coalesce(a.parameterid,'') like ? "+
    " or coalesce(a.paramname,'') like ? "+
    " or coalesce(a.paramvalue,'') like ? "+
    " or coalesce(a.description,'') like ? "+
    " or coalesce(b.modulename,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Modules API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		parameterid = helper.getsearchtext(req.body.parameterid,'','string'),
		paramname = helper.getsearchtext(req.body.paramname,'','string'),
		paramvalue = helper.getsearchtext(req.body.paramvalue,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		modulename = helper.getsearchtext(req.body.description,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and parameterid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[parameterid,paramname,paramvalue,description,modulename],
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
        parameterid = helper.getsearchtext(req.body.parameterid,'','string'),
		paramname = helper.getsearchtext(req.body.paramname,'','string'),
		paramvalue = helper.getsearchtext(req.body.paramvalue,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [parameterid,paramname,paramvalue,description,modulename];
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
		parameterid = helper.getsearchtext(req.body.parameterid,'','string'),
		paramname = helper.getsearchtext(req.body.paramname,'','string'),
		paramvalue = helper.getsearchtext(req.body.paramvalue,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		modulename = helper.getsearchtext(req.body.modulename,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[parameterid,paramname,paramvalue,description,modulename],
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
			var sqlq = sqlselect + sqlfrom + " where a.parameterid = ?";
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
	parameterid = req.body.parameterid,
	paramname = req.body.paramname,
	paramvalue = req.body.paramvalue,
	description = req.body.description,
	moduleid = req.body.moduleid,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[paramname,'emptyparamname','required'],
				[paramvalue,'emptyparamvalue','required'],
				[description,'emptydescription','required'],
				[moduleid,'emptymodule','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [paramname,paramvalue,description,moduleid,recordstatus,datauser];
						if ((parameterid == null) || (parameterid == '')) {
							var sql = 'call Insertparameter(?,?,?,?,?,?)';
						} else {
							var sql = 'call Updateparameter(?,?,?,?,?,?,?)';
							sqlarray = [parameterid].concat(sqlarray);
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
				[id,'emptyparameterid','required'],
				[id,'parameteridnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeparameter(?,?)';
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