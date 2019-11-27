'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,f.productname,g.uomcode,h.uomcode as uom2code,i.uomcode as uom3code,j.uomcode as uom4code,k.processprdname, "+
	"l.namamesin,c.sono,m.sloccode,d.fullname ";
var sqlfrom =
	"FROM productionschedule a "+
	"left join productplan b on b.productplanid = a.productplanid "+
	"left join soheader c on c.soheaderid = a.soheaderid "+
	"left join addressbook d on d.addressbookid = a.addressbookid "+
	"left join productplan e on e.productplanid = b.parentplanid "+
	"left join product f on f.productid = a.productid "+
	"left join unitofmeasure g on g.unitofmeasureid = a.uomid "+
	"left join unitofmeasure h on h.unitofmeasureid = a.uom2id "+
	"left join unitofmeasure i on i.unitofmeasureid = a.uom3id "+
	"left join unitofmeasure j on j.unitofmeasureid = a.uom4id "+
	"left join processprd k on k.processprdid = a.processprdid "+
	"left join mesin l on l.mesinid = a.mesinid "+
	"left join sloc m on m.slocid = a.sloctoid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.productionscheduleid,'') like ? "+
	" and coalesce(d.fullname,'') like ? ";
var sqlwherecombo = " where coalesce(a.productionscheduleid,'') like ? "+
	" or coalesce(d.fullname,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Production Schedule API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		productionscheduleid = helper.getsearchtext(req.body.productionscheduleid,'','string'),
		fullname = helper.getsearchtext(req.body.fullname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and productionscheduleid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[productionscheduleid,fullname],
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
        productionscheduleid = helper.getsearchtext(req.body.productionscheduleid,'','string'),
		fullname = helper.getsearchtext(req.body.fullname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [productionscheduleid,fullname];
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
		productionscheduleid = helper.getsearchtext(req.body.productionscheduleid,'','string'),
		fullname = helper.getsearchtext(req.body.fullname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[productionscheduleid,fullname],
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
			var sqlq = sqlselect + sqlfrom + " where a.productionscheduleid = ?";
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
	productionscheduleid = req.body.productionscheduleid,
	fullname = req.body.fullname,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[fullname,'emptyfullname','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [fullname,recordstatus,datauser];
						if ((productionscheduleid == null) || (productionscheduleid == '')) {
							var sql = 'call Insertproductionschedule(?,?,?)';
						} else {
							var sql = 'call Updateproductionschedule(?,?,?,?)';
							sqlarray = [productionscheduleid].concat(sqlarray);
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
				[id,'emptyproductionscheduleid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeproductionschedule(?,?)';
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