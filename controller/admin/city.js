'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,b.provincecode,b.provincename ";
var sqlfrom =
    "FROM city a "+
    "left join province b on b.provinceid = a.provinceid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.cityid,'') like ? "+
    " and coalesce(b.provincecode,'') like ? "+
    " and coalesce(b.provincename,'') like ? "+
    " and coalesce(a.citycode,'') like ? "+
    " and coalesce(a.cityname,'') like ? ";
var sqlwherecombo = " where coalesce(a.cityid,'') like ? "+
    " or coalesce(b.provincecode,'') like ? "+
    " or coalesce(b.provincename,'') like ? "+
    " or coalesce(a.citycode,'') like ? "+
    " or coalesce(a.cityname,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("City API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		cityid = helper.getsearchtext(req.body.cityid,'','string'),
		citycode = helper.getsearchtext(req.body.citycode,'','string'),
		cityname = helper.getsearchtext(req.body.cityname,'','string'),
		provincecode = helper.getsearchtext(req.body.provincecode,'','string'),
		provincename = helper.getsearchtext(req.body.provincename,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and cityid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[cityid,provincecode,provincename,citycode,cityname],
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
        cityid = helper.getsearchtext(req.body.cityid,'','string'),
		citycode = helper.getsearchtext(req.body.citycode,'','string'),
		cityname = helper.getsearchtext(req.body.cityname,'','string'),
		provincecode = helper.getsearchtext(req.body.provincecode,'','string'),
		provincename = helper.getsearchtext(req.body.provincename,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [cityid,provincecode,provincename,citycode,cityname];
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
        cityid = helper.getsearchtext(req.body.cityid,'','string'),
        citycode = helper.getsearchtext(req.body.citycode,'','string'),
        cityname = helper.getsearchtext(req.body.cityname,'','string'),
        provincecode = helper.getsearchtext(req.body.provincecode,'','string'),
        provincename = helper.getsearchtext(req.body.provincename,'','string'),
        sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[cityid,provincecode,provincename,citycode,cityname],
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
			var sqlq = sqlselect + sqlfrom + " where a.cityid = ?";
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
	cityid = req.body.cityid,
	provinceid = req.body.provinceid,
	citycode = req.body.citycode,
	cityname = req.body.cityname,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[provinceid,'emptyprovince','required'],
				[citycode,'emptycitycode','required'],
				[cityname,'emptycityname','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [provinceid,citycode,cityname,recordstatus,datauser];
						if ((cityid == null) || (cityid == '')) {
							var sql = 'call Insertcity(?,?,?,?,?)';
						} else {
							var sql = 'call Updatecity(?,?,?,?,?,?)';
							sqlarray = [cityid].concat(sqlarray);
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
				[id,'emptycityid','required'],
				[id,'cityidnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgecity(?,?)';
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