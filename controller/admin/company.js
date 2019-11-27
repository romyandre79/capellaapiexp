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
	"FROM company a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.companyid,'') like ? "+
    " and coalesce(a.companyname,'') like ? "+
    " and coalesce(a.companycode,'') like ? ";
var sqlwherecombo = " where (coalesce(a.companyid,'') like ? "+
    " or coalesce(a.companyname,'') like ? "+
    " or coalesce(a.companycode,'') like ?) ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Company API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		companyid = helper.getsearchtext(req.body.companyid,'','string'),
		companyname = helper.getsearchtext(req.body.companyname,'','string'),
		companycode = helper.getsearchtext(req.body.companycode,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and companyid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[companyid,companyname,companycode],
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
        companyid = helper.getsearchtext(req.body.companyid,'','string'),
		companyname = helper.getsearchtext(req.body.companyname,'','string'),
		companycode = helper.getsearchtext(req.body.companycode,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [companyid,companyname,companycode];
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
		companyid = helper.getsearchtext(req.body.companyid,'','string'),
		companyname = helper.getsearchtext(req.body.companyname,'','string'),
		companycode = helper.getsearchtext(req.body.companycode,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwherecombo;
            sqlw = sqlw + " and companyid in ("+ helper.getuserobjectvalues +") ";
			var sqlq = sqlselect + sqlfrom + sqlw + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[companyid,companyname,companycode],
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
			var sqlq = sqlselect + sqlfrom + " where a.companyid = ?";
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
	companyid = req.body.companyid,
	companyname = req.body.companyname,
	companycode = req.body.companycode,
	address = req.body.address,
	cityid = req.body.cityid,
	zipcode = req.body.zipcode,
	taxno = req.body.taxno,
	currencyid = req.body.currencyid,
	faxno = req.body.faxno,
	phoneno = req.body.phoneno,
	webaddress = req.body.webaddress,
	email = req.body.email,
	leftlogofile = req.body.leftlogofile,
	rightlogofile = req.body.rightlogofile,
	isholding = req.body.isholding,
	billto = req.body.billto,
	bankacc1 = req.body.bankacc1,
	bankacc2 = req.body.bankacc2,
	bankacc3 = req.body.bankacc3,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[companyname,'emptycompanyname','required'],
				[companycode,'emptycompanycode','required'],
				[address,'emptyaddress','required'],
				[cityid,'emptycity','required'],
				[zipcode,'emptyzipcode','required'],
				[taxno,'emptytaxno','required'],
				[currencyid,'emptycurrency','required'],
				[billto,'emptybillto','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [companycode,companyname,address,cityid,zipcode,taxno,currencyid,faxno,phoneno,webaddress,email,leftlogofile,rightlogofile,isholding,billto,bankacc1,bankacc2,bankacc3,recordstatus,datauser];
						if ((companyid == null) || (companyid == '')) {
							var sql = 'call Insertcompany(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatecompany(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
							sqlarray = [companyid].concat(sqlarray);
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
				[id,'emptycompanyid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgecompany(?,?)';
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