'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,d.fullname,e.addressname,f.productname,g.uomcode,h.uomcode as uom2code, "+
    "i.uomcode as uom3code, j.uomcode as uom4code,c.giqty as qtygi,c.qty,(c.qty - c.giqty) as qtyout ";
var sqlfrom =
    "FROM deliveryschedule a "+
    "left join soheader b on b.soheaderid = a.soheaderid "+
    "left join sodetail c on c.sodetailid = a.sodetailid "+
    "left join addressbook d on d.addressbookid = a.addressbookid "+
    "left join address e on e.addressid = a.addressid "+
    "left join product f on f.productid = a.productid "+
    "left join unitofmeasure g on g.unitofmeasureid = a.uomid "+
    "left join unitofmeasure h on h.unitofmeasureid = a.uom2id "+
    "left join unitofmeasure i on i.unitofmeasureid = a.uom3id "+
    "left join unitofmeasure j on j.unitofmeasureid = a.uom4id ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.deliveryscheduleid,'') like ? "+
    " and coalesce(a.docno,'') like ? "+
    " and coalesce(a.delvdate,'') like ? "+
    " and coalesce(d.fullname,'') like ? "+
    " and coalesce(e.addressname,'') like ? "+
    " and coalesce(f.productname,'') like ? "+
    " and coalesce(g.uomcode,'') like ? ";
var sqlwherecombo = " where coalesce(a.deliveryscheduleid,'') like ? "+
	" or coalesce(a.docno,'') like ? "+
	" or coalesce(a.delvdate,'') like ? "+
    " or coalesce(d.fullname,'') like ? "+
    " or coalesce(e.addressname,'') like ? "+
    " or coalesce(f.productname,'') like ? "+
    " or coalesce(g.uomcode,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Delivery Schedule API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		deliveryscheduleid = helper.getsearchtext(req.body.deliveryscheduleid,'','string'),
		docno = helper.getsearchtext(req.body.docno,'','string'),
		delvdate = helper.getsearchtext(req.body.delvdate,'','string'),
		addressname = helper.getsearchtext(req.body.addressname,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		uomcode = helper.getsearchtext(req.body.uomcode,'','string'),
		fullname = helper.getsearchtext(req.body.fullname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and deliveryscheduleid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[deliveryscheduleid,docno,delvdate,fullname,addressname,productname,uomcode],
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
        deliveryscheduleid = helper.getsearchtext(req.body.deliveryscheduleid,'','string'),
        docno = helper.getsearchtext(req.body.docno,'','string'),
        delvdate = helper.getsearchtext(req.body.delvdate,'','string'),
		addressname = helper.getsearchtext(req.body.addressname,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		uomcode = helper.getsearchtext(req.body.uomcode,'','string'),
		fullname = helper.getsearchtext(req.body.fullname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [deliveryscheduleid,docno,delvdate,fullname,addressname,productname,uomcode];
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
		deliveryscheduleid = helper.getsearchtext(req.body.deliveryscheduleid,'','string'),
		docno = helper.getsearchtext(req.body.docno,'','string'),
        docno = helper.getsearchtext(req.body.docno,'','string'),
        delvdate = helper.getsearchtext(req.body.delvdate,'','string'),
		addressname = helper.getsearchtext(req.body.addressname,'','string'),
		productname = helper.getsearchtext(req.body.productname,'','string'),
		uomcode = helper.getsearchtext(req.body.uomcode,'','string'),
		fullname = helper.getsearchtext(req.body.fullname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[deliveryscheduleid,docno,delvdate,fullname,addressname,productname,uomcode],
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
			var sqlq = sqlselect + sqlfrom + " where a.deliveryscheduleid = ?";
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
	deliveryscheduleid = req.body.deliveryscheduleid,
	docno = req.body.docno,
	soheaderid = req.body.soheaderid,
	sodetailid = req.body.sodetailid,
	addressbookid = req.body.addressbookid,
	addressid = req.body.addressid,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[docno,'emptydocno','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [docno,recordstatus,datauser];
						if ((deliveryscheduleid == null) || (deliveryscheduleid == '')) {
							var sql = 'call Insertdeliveryschedule(?,?,?)';
						} else {
							var sql = 'call Updatedeliveryschedule(?,?,?,?)';
							sqlarray = [deliveryscheduleid].concat(sqlarray);
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
				[id,'emptydeliveryscheduleid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgedeliveryschedule(?,?)';
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