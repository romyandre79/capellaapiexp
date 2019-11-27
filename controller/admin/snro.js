'use strict';

var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.* "+
    ", (select ifnull(count(1),0) from snrodet z where z.snroid = a.snroid) as jumlah ";
var sqlfrom =
	"FROM snro a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.snroid,'') like ? "+
    " and coalesce(a.description,'') like ? "+
    " and coalesce(a.formatdoc,'') like ? "+
    " and coalesce(a.formatno,'') like ? "+
    " and coalesce(a.repeatby,'') like ? ";
var sqlwherecombo = " where coalesce(a.snroid,'') like ? "+
    " or coalesce(a.description,'') like ? "+
    " and coalesce(a.formatdoc,'') like ? "+
    " and coalesce(a.formatno,'') like ? "+
    " and coalesce(a.repeatby,'') like ? ";
var sqlorder = " order by ";
var sqlselect1 = "select t.*,q.plantcode ";
var sqlfrom1 = " from snrodet t "+
    " left join plant q on q.plantid = t.plantid ";
var sqlwhere1 = " where t.snroid = ?";

exports.index = async function(req, res){
	res.send("Specific Number Range Object (SNRO) API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		snroid = helper.getsearchtext(req.body.snroid,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		formatdoc = helper.getsearchtext(req.body.formatdoc,'','string'),
		formatno = helper.getsearchtext(req.body.formatno,'','string'),
		repeatby = helper.getsearchtext(req.body.repeatby,'','string'),
		plantcode = helper.getsearchtext(req.body.plantcode,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere;
            var wherearray = [snroid,description,formatdoc,formatno,repeatby];
			if (id != '') {
				sqlw = sqlw + " and snroid in ("+id+") ";
            }
            if (plantcode != '%%') {
                sqlw = sqlw + " and snroid in ( "+
                    " select distinct snroid "+
                    " from snrodet z "+
                    " left join plant za on za.plantid = z.plantid "+
                    " where coalesce(za.plantcode,'') like ?)"
                wherearray.push(plantcode);
            }
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				wherearray,
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
        snroid = helper.getsearchtext(req.body.snroid,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		formatdoc = helper.getsearchtext(req.body.formatdoc,'','string'),
		formatno = helper.getsearchtext(req.body.formatno,'','string'),
		repeatby = helper.getsearchtext(req.body.repeatby,'','string'),
		plantcode = helper.getsearchtext(req.body.plantcode,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
            var wherearray = [snroid,description,formatdoc,formatno,repeatby];
            if (plantcode != '%%') {
                sqlw = sqlw + " and snroid in ( "+
                    " select distinct z.snroid "+
                    " from snrodet z "+
                    " left join plant za on za.plantid = z.plantid "+
                    " where coalesce(za.plantcode,'') like ? )";
                wherearray.push(plantcode);
            }
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

exports.list1 = async function(req, res) {
    var token = req.body.token,
        snroid = req.body.snroid,
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere1;
            var wherearray = [snroid]
			var sqlq = sqlcount + sqlfrom1 + sqlw;
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
					var sqlq = sqlselect1 + sqlfrom1 + sqlw + sqlorder + sort + sqloffset;	
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
		snroid = helper.getsearchtext(req.body.snroid,'','string'),
		description = helper.getsearchtext(req.body.description,'','string'),
		formatdoc = helper.getsearchtext(req.body.formatdoc,'','string'),
		formatno = helper.getsearchtext(req.body.formatno,'','string'),
		repeatby = helper.getsearchtext(req.body.repeatby,'','string'),
		plantcode = helper.getsearchtext(req.body.plantcode,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwherecombo;
            var wherearray = [snroid,description,formatdoc,formatno,repeatby];
            if (plantcode != '%%') {
                sqlw = sqlw + " or snroid in ( "+
                    " select distinct snroid "+
                    " from snrodet z "+
                    " left join plant za on za.plantid = z.plantid "+
                    " where coalesce(za.plantcode,'') like ?)"
                wherearray.push(plantcode);
            }
			var sqlq = sqlselect + sqlfrom + sqlw + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				wherearray,
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
			var sqlq = sqlselect + sqlfrom + " where a.snroid = ?";
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
	snroid = req.body.snroid,
	description = req.body.description,
	formatdoc = req.body.formatdoc,
	formatno = req.body.formatno,
	repeatby = req.body.repeatby,
	recordstatus = req.body.recordstatus,
    datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[description,'emptydescription','required'],
				[formatdoc,'emptyformatdoc','required'],
				[formatno,'emptyformatno','required'],
				[repeatby,'emptyrepeatby','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
                        var sqlarray = [snroid,description,formatdoc,formatno,repeatby,recordstatus,datauser];
                        var sql = 'call Modifsnro(?,?,?,?,?,?,?)';
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

exports.save1 = async function(req, res) {
	var token = req.body.token,
	snrodetid = req.body.snrodetid,
	snroid = req.body.snroid,
	plantid = req.body.plantid,
	curdd = req.body.curdd,
	curmm = req.body.curmm,
	curyy = req.body.curyy,
	curvalue = req.body.curvalue,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[snroid,'emptysnro','required'],
				[plantid,'emptyplant','required'],
				[curdd,'emptycurdd','required'],
				[curmm,'emptycurmm','required'],
				[curyy,'emptycuryy','required'],
				[curvalue,'emptycurvalue','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [plantid,snroid,curdd,curmm,curyy,curvalue,datauser];
						if ((snrodetid == null) || (snrodetid == '')) {
							var sql = 'call Insertsnrodet(?,?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatesnrodet(?,?,?,?,?,?,?,?)';
							sqlarray = [snrodetid].concat(sqlarray);
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
				[id,'emptysnroid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgesnro(?,?)';
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

exports.purge1 = async function(req, res) {
	var token = req.body.token,
	id = req.body.id,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[id,'emptysnrodet','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgesnrodet(?,?)';
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