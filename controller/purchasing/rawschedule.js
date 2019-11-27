'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,d.fullname,e.sloccode,f.productname,g.uomcode,h.uomcode as uom2code,k.namamesin ";
var sqlfrom =
    "FROM rawschedule a "+
    "left join poheader b on b.poheaderid = a.poheaderid "+
    "left join podetail c on c.poheaderid = b.poheaderid "+
    "left join addressbook d on d.addressbookid = a.addressbookid "+
    "left join sloc e on e.slocid = a.slocid "+
    "left join product f on f.productid = a.productid "+
    "left join unitofmeasure g on g.unitofmeasureid = a.uomid "+
    "left join unitofmeasure h on h.unitofmeasureid = a.uom2id "+
    "left join unitofmeasure i on i.unitofmeasureid = a.uom3id "+
    "left join unitofmeasure j on j.unitofmeasureid = a.uom4id "+
    "left join mesin k on k.mesinid = a.mesinid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.rawscheduleid,'') like ? "+
	" and coalesce(f.productname,'') like ? ";
var sqlwherecombo = " where coalesce(a.rawscheduleid,'') like ? "+
	" or coalesce(f.productname,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Raw Schedule API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		rawscheduleid = helper.getsearchtext(req.body.rawscheduleid,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and rawscheduleid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[rawscheduleid,productname],
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
        rawscheduleid = helper.getsearchtext(req.body.rawscheduleid,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [rawscheduleid,productname];
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
		rawscheduleid = helper.getsearchtext(req.body.rawscheduleid,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[rawscheduleid,productname],
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
			var sqlq = sqlselect + sqlfrom + " where a.rawscheduleid = ?";
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
	rawscheduleid = req.body.rawscheduleid,
	productname = req.body.productname,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[productname,'emptyproductname','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [productname,recordstatus,datauser];
						if ((rawscheduleid == null) || (rawscheduleid == '')) {
							var sql = 'call Insertrawschedule(?,?,?)';
						} else {
							var sql = 'call Updaterawschedule(?,?,?,?)';
							sqlarray = [rawscheduleid].concat(sqlarray);
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
				[id,'emptyrawscheduleid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgerawschedule(?,?)';
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