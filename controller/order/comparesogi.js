'use strict';

var response = require('../../res');
var log = require('../../config/logger');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT b.companyid,b.companycode,a.plantid,a.plantcode,year(NOW()), "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 1 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS janso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 1 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS jangi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 2 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS febso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 2 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS febgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 3 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS marso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 3 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS margi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 4 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS aprso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 4 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS aprgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 5 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS meiso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 5 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS meigi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 6 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS junso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 6 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS jungi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 7 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS julso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 7 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS julgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 8 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS agtso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 8 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS agtgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 9 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS sepso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 9 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS sepgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 10 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS oktso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 10 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS oktgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 11 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS novso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 11 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS novgi, "+
"( "+
"SELECT SUM(getamountdetailbyso(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 12 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS desso, "+
"( "+
"SELECT SUM(getamountdetailbysogi(za.soheaderid,zb.sodetailid)) "+
"FROM soheader za "+
"JOIN sodetail zb ON zb.soheaderid = za.soheaderid "+
"where MONTH(zb.delvdate) = 12 "+
"AND YEAR(zb.delvdate) = YEAR(NOW()) "+
"AND za.plantid = a.plantid "+
"AND za.recordstatus >= 3 "+
") AS desgi ";
var sqlfrom =
	"FROM plant a "+
    "LEFT JOIN company b ON b.companyid = a.companyid ";

exports.index = async function(req, res){
	res.send("Compare SO vs GI API Index");
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