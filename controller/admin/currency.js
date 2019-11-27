'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,b.countryname ";
var sqlfrom =
    "FROM currency a "+
    "left join country b on b.countryid = a.countryid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.currencyid,'') like ? "+
    " and coalesce(b.countryname,'') like ? "+
	" and coalesce(a.currencyname,'') like ? ";
var sqlwherecombo = " where coalesce(a.currencyid,'') like ? "+
    " or coalesce(b.countryname,'') like ? "+
	" or coalesce(a.currencyname,'') like ? ";
var sqlorder = " order by ";

exports.index = async function(req, res){
	res.send("Currency API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		currencyid = helper.getsearchtext(req.body.currencyid,'','string'),
		currencyname = helper.getsearchtext(req.body.currencyname,'','string'),
		countryname = helper.getsearchtext(req.body.countryname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and currencyid in ("+id+") ";
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[currencyid,countryname,currencyname],
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
        currencyid = helper.getsearchtext(req.body.currencyid,'','string'),
		currencyname = helper.getsearchtext(req.body.currencyname,'','string'),
		countryname = helper.getsearchtext(req.body.countryname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [currencyid,countryname,currencyname];
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
		currencyid = helper.getsearchtext(req.body.currencyid,'','string'),
		currencyname = helper.getsearchtext(req.body.currencyname,'','string'),
		countryname = helper.getsearchtext(req.body.countryname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[currencyid,countryname,currencyname],
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
			var sqlq = sqlselect + sqlfrom + " where a.currencyid = ?";
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
	currencyid = req.body.currencyid,
	currencyname = req.body.currencyname,
	countryid = req.body.countryid,
	symbol = req.body.symbol,
	i18n = req.body.i18n,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[currencyname,'emptycurrencyname','required'],
				[countryid,'emptycountry','required'],
				[symbol,'emptysymbol','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [countryid,currencyname,symbol,i18n,recordstatus,datauser];
						if ((currencyid == null) || (currencyid == '')) {
							var sql = 'call Insertcurrency(?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatecurrency(?,?,?,?,?,?,?)';
							sqlarray = [currencyid].concat(sqlarray);
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
				[id,'emptycurrencyid','required'],
				[id,'currencyidnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgecurrency(?,?)';
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