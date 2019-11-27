'use strict';

var response = require('../../res');;
var connection = require('../../config/db');
var helper = require('../../helper');
var result = {
	total:0,
	rows:{}
};
var sqlselect = "SELECT a.* "+
    ",( "+
    " select ifnull(count(1),0) "+
    " from groupmenuauth z "+
    " where z.menuauthid = a.menuauthid "+
    ") as jumlah ";
var sqlfrom =
	"FROM menuauth a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.menuauthid,'') like ? "+
	" and coalesce(a.menuobject,'') like ? ";
var sqlwherecombo = " where coalesce(a.menuauthid,'') like ? "+
	" or coalesce(a.menuobject,'') like ? ";
var sqlorder = " order by ";
var sqlselect1 = "select t.*,q.groupname ";
var sqlfrom1 = " from groupmenuauth t "+
    " left join groupaccess q on q.groupaccessid = t.groupaccessid ";
var sqlwhere1 = " where t.menuauthid = ?";

exports.index = async function(req, res){
	res.send("Menu Object API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		menuauthid = helper.getsearchtext(req.body.menuauthid,'','string'),
		menuobject = helper.getsearchtext(req.body.menuobject,'','string'),
		menuvalueid = helper.getsearchtext(req.body.menuvalueid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere;
            var wherearray = [menuauthid,menuobject];
			if (id != '') {
				sqlw = sqlw + " and menuauthid in ("+id+") ";
            }
            if (menuvalueid != '%%') {
                sqlw = sqlw + " and menuauthid in ( "+
                    " select distinct menuvalueid "+
                    " from groupmenuauth z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(z.menuvalueid,'') like ?)"
                wherearray.push(menuvalueid);
            }
            if (groupname != '%%') {
                sqlw = sqlw + " and menuauthid in ( "+
                    " select distinct menuvalueid "+
                    " from groupmenuauth z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(za.groupname,'') like ?)"
                wherearray.push(groupname);
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
        menuauthid = helper.getsearchtext(req.body.menuauthid,'','string'),
        menuobject = helper.getsearchtext(req.body.menuobject,'','string'),
        menuvalueid = helper.getsearchtext(req.body.menuvalueid,'','string'),
        groupname = helper.getsearchtext(req.body.groupname,'','string'),
        page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
            var wherearray = [menuauthid,menuobject];
            if (menuvalueid != '%%') {
                sqlw = sqlw + " and menuauthid in ( "+
                    " select distinct menuvalueid "+
                    " from groupmenuauth z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(z.menuvalueid,'') like ?)"
                wherearray.push(menuvalueid);
            }
            if (groupname != '%%') {
                sqlw = sqlw + " and menuauthid in ( "+
                    " select distinct menuvalueid "+
                    " from groupmenuauth z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(za.groupname,'') like ?)"
                wherearray.push(groupname);
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
        menuauthid = req.body.menuauthid,
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere1;
            var wherearray = [menuauthid]
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
        menuauthid = helper.getsearchtext(req.body.menuauthid,'','string'),
        menuobject = helper.getsearchtext(req.body.menuobject,'','string'),
        menuvalueid = helper.getsearchtext(req.body.menuvalueid,'','string'),
        groupname = helper.getsearchtext(req.body.groupname,'','string'),
        sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwherecombo;
            var wherearray = [menuauthid,menuobject];
            if (menuvalueid != '%%') {
                sqlw = sqlw + " and menuauthid in ( "+
                    " select distinct menuvalueid "+
                    " from groupmenuauth z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(z.menuvalueid,'') like ?)"
                wherearray.push(menuvalueid);
            }
            if (groupname != '%%') {
                sqlw = sqlw + " and menuauthid in ( "+
                    " select distinct menuvalueid "+
                    " from groupmenuauth z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(za.groupname,'') like ?)"
                wherearray.push(groupname);
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
			var sqlq = sqlselect + sqlfrom + " where a.menuauthid = ?";
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
	menuauthid = req.body.menuauthid,
	menuobject = req.body.menuobject,
	recordstatus = req.body.recordstatus,
    datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[menuobject,'emptymenuobject','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
                        var sqlarray = [menuauthid,menuobject,recordstatus,datauser];
                        var sql = 'call Modifmenuauth(?,?,?,?)';
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
	groupmenuauthid = req.body.groupmenuauthid,
	groupaccessid = req.body.groupaccessid,
	menuauthid = req.body.menuauthid,
    menuvalueid = req.body.menuvalueid,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[menuauthid,'emptymenuauth','required'],
				[groupaccessid,'emptygroupaccess','required'],
				[menuvalueid,'emptymenuvalue','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [groupaccessid,menuauthid,menuvalueid,datauser];
						if ((groupmenuauthid == null) || (groupmenuauthid == '')) {
							var sql = 'call Insertgroupmenuauth(?,?,?,?)';
						} else {
							var sql = 'call Updategroupmenuauth(?,?,?,?,?)';
							sqlarray = [groupmenuauthid].concat(sqlarray);
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
				[id,'emptymenuauthid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgemenuauth(?,?)';
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
				[id,'emptygroupmenu','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgegroupmenuauth(?,?)';
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