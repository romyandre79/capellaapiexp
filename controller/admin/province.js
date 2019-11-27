'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,b.countrycode,b.countryname ";
var sqlfrom =
    "FROM province a "+
    " left join country b on b.countryid = a.countryid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.provinceid,'') like ? "+
    " and coalesce(b.countrycode,'') like ? "+
    " and coalesce(b.countryname,'') like ? "+
    " and coalesce(a.provincecode,'') like ? "+
    " and coalesce(a.provincename,'') like ? ";
var sqlwherecombo = " where coalesce(a.provinceid,'') like ? "+
    " or coalesce(b.countrycode,'') like ? "+
    " or coalesce(b.countryname,'') like ? "+
    " or coalesce(a.provincecode,'') like ? "+
    " or coalesce(a.provincename,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Province API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		provinceid = helper.getsearchtext(req.body.provinceid,'','string'),
		countrycode = helper.getsearchtext(req.body.countrycode,'','string'),
		countryname = helper.getsearchtext(req.body.countryname,'','string'),
		provincecode = helper.getsearchtext(req.body.provincecode,'','string'),
		provincename = helper.getsearchtext(req.body.provincename,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and provinceid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[provinceid,countrycode,countryname,provincecode,provincename],
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
        provinceid = helper.getsearchtext(req.body.provinceid,'','string'),
		countrycode = helper.getsearchtext(req.body.countrycode,'','string'),
		countryname = helper.getsearchtext(req.body.countryname,'','string'),
		provincecode = helper.getsearchtext(req.body.provincecode,'','string'),
		provincename = helper.getsearchtext(req.body.provincename,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rows = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [provinceid,countrycode,countryname,provincecode,provincename];
			var sqlq = sqlcount + sqlfrom + sqlw;
			connection.query(sqlq,
				wherearray,
				function (error, rows, fields){
					if (error != undefined) {
						helper.getmessage(true,error.message,res);
					}
					result['total'] = rows[0]['total'];
				});
			var offset = '';
			var sqloffset = '';
			helper.getoffset(page,rows,function(retoffset,retsqloffset){
				offset = retoffset;
				sqloffset = retsqloffset;
			});
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort + sqloffset;	
			wherearray.push(offset,rows);
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
		}
	});
};

exports.listcombo = async function(req, res) {
	var token = req.body.token,
		provinceid = helper.getsearchtext(req.body.provinceid,'','string'),
		countrycode = helper.getsearchtext(req.body.countrycode,'','string'),
		countryname = helper.getsearchtext(req.body.countryname,'','string'),
		provincecode = helper.getsearchtext(req.body.provincecode,'','string'),
		provincename = helper.getsearchtext(req.body.provincename,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[provinceid,countrycode,countryname,provincecode,provincename],
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
			var sqlq = sqlselect + sqlfrom + " where a.provinceid = ?";
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
	provinceid = req.body.provinceid,
	countryid = req.body.countryid,
	provincecode = req.body.provincecode,
	provincename = req.body.provincename,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[countryid,'emptycountry','required'],
				[provincecode,'emptyprovincecode','required'],
				[provincename,'emptyprovincename','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [countryid,provincecode,provincename,recordstatus,datauser];
						if ((provinceid == null) || (provinceid == '')) {
							var sql = 'call Insertprovince(?,?,?,?,?)';
						} else {
							var sql = 'call Updateprovince(?,?,?,?,?,?)';
							sqlarray = [provinceid].concat(sqlarray);
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
				[id,'emptyprovinceid','required'],
				[id,'provinceidnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeprovince(?,?)';
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