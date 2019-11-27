'use strict';

var response = require('../../res');
var log = require('../../config/logger');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT b.companyid,b.companycode,a.plantid,a.plantcode,year(now()) as tahun, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 1 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS jan, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 1 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS janold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 2 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS feb, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+	
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 2 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS febold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 3 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS mar, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+	
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 3 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS marold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 4 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS apr, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 4 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS aprold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 5 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS mei, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 5 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS meiold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 6 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS jun, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 6 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS junold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
    "FROM sodetail z "+
	"WHERE month(z.delvdate) = 7 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS jul, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 7 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS julold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 8 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS agt, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 8 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS agtold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 9 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS sep, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 9 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS sepold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 10 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS okt, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 10 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS oktold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL	"+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 11 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS nov, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL	"+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 11 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS novold, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL	"+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 12 AND YEAR(z.delvdate) = YEAR(NOW()) "+
	") "+
	"AND za.plantid = a.plantid "+
") AS des, "+
"( "+
	"SELECT ifnull(sum(ifnull(getamountbyso(za.soheaderid),0)),0) "+
	"FROM soheader za "+
	"WHERE za.sono IS NOT NULL "+
	"AND za.recordstatus >= 3 "+
	"AND za.soheaderid IN "+
	"( "+
	"SELECT distinct z.soheaderid "+
	"FROM sodetail z "+
	"WHERE month(z.delvdate) = 12 AND YEAR(z.delvdate) = YEAR(NOW())-1 "+
	") "+
	"AND za.plantid = a.plantid "+
") AS desold ";
var sqlfrom =
	"FROM plant a "+
    "LEFT JOIN company b ON b.companyid = a.companyid ";

exports.index = async function(req, res){
	res.send("Periodic Sales API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlq = sqlselect + sqlfrom;
            log.error(sqlq);
			connection.query(sqlq,
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