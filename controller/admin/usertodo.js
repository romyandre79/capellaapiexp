'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.*,b.plantcode,c.username ";
var sqlfrom =
    "FROM usertodo a "+
    "left join plant b on b.plantid = a.plantid "+
    "left join useraccess c on c.useraccessid = a.useraccessid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.usertodoid,'') like ? "+
    " and coalesce(b.plantcode,'') like ? "+
    " and c.authkey =  ? ";
var sqlorder = " order by usertodoid ";

exports.index = async function(req, res){
	res.send("User TODO API Index");
}

exports.list = async function(req, res) {
    var token = req.body.token,
        usertodoid = helper.getsearchtext(req.body.usertodoid,'','string'),
		plantcode = helper.getsearchtext(req.body.plantcode,'','string');
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [usertodoid,plantcode,token];
			var sqlq = sqlcount + sqlfrom + sqlw;
			connection.query(sqlq,
				wherearray,
				function (error, rows, fields){
					if (error != undefined) {
						helper.getmessage(true,error.message,res);
					}
					result['total'] = rows[0]['total'];
					var sqlq = sqlselect + sqlfrom + sqlw + sqlorder;	
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

exports.purge = async function(req, res) {
	var token = req.body.token,
	id = req.body.id,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[id,'emptyusertodoid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeusertodo(?,?)';
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