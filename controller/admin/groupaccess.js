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
	"FROM groupaccess a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.groupaccessid,'') like ? "+
	" and coalesce(a.groupname,'') like ? ";
var sqlwherecombo = " where coalesce(a.groupaccessid,'') like ? "+
	" or coalesce(a.groupname,'') like ? ";
var sqlorder = " order by ";
var sqlselect1 = "select t.*,q.menuname,q.description ";
var sqlfrom1 = " from groupmenu t "+
    " left join menuaccess q on q.menuaccessid = t.menuaccessid ";
var sqlwhere1 = " where t.groupaccessid = ?";

exports.index = async function(req, res){
	res.send("Group Access API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		groupaccessid = helper.getsearchtext(req.body.groupaccessid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere;
            var wherearray = [groupaccessid,groupname,menuname];
			if (id != '') {
				sqlw = sqlw + " and groupaccessid in ("+id+") ";
            }
            if (menuname != '%%') {
                sqlw = sqlw + " and groupaccessid in ( "+
                    " select distinct groupaccessid "+
                    " from groupmenu z "+
                    " left join menuaccess za on za.menuaccessid = z.menuaccessid "+
                    " where coalesce(za.menuname,'') like ?)"
                wherearray.push(menuname);
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
        groupaccessid = helper.getsearchtext(req.body.groupaccessid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
            var wherearray = [groupaccessid,groupname];
            if (menuname != '%%') {
                sqlw = sqlw + " and groupaccessid in ( "+
                    " select distinct z.groupaccessid "+
                    " from groupmenu z "+
                    " left join menuaccess za on za.menuaccessid = z.menuaccessid "+
                    " where coalesce(za.menuname,'') like ? )";
                wherearray.push(menuname);
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
        groupaccessid = req.body.groupaccessid,
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere1;
            var wherearray = [groupaccessid]
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
		groupaccessid = helper.getsearchtext(req.body.groupaccessid,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		menuname = helper.getsearchtext(req.body.menuname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwherecombo;
            var wherearray = [groupaccessid,groupname,menuname];
            if (menuname != '%%') {
                sqlw = sqlw + " or groupaccessid in ( "+
                    " select distinct groupaccessid "+
                    " from groupmenu z "+
                    " left join menuaccess za on za.menuaccessid = z.menuaccessid "+
                    " where coalesce(za.menuname,'') like ?)"
                wherearray.push(menuname);
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
			var sqlq = sqlselect + sqlfrom + " where a.groupaccessid = ?";
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
	groupaccessid = req.body.groupaccessid,
	groupname = req.body.groupname,
	recordstatus = req.body.recordstatus,
    datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[groupname,'emptygroupname','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
                        var sqlarray = [groupaccessid,groupname,recordstatus,datauser];
                        var sql = 'call ModifGroupAccess(?,?,?,?)';
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
	groupmenuid = req.body.groupmenuid,
	groupaccessid = req.body.groupaccessid,
	menuaccessid = req.body.menuaccessid,
	isread = req.body.isread,
	iswrite = req.body.iswrite,
	ispost = req.body.ispost,
	isreject = req.body.isreject,
	isupload = req.body.isupload,
    isdownload = req.body.isdownload,
    ispurge = req.body.ispurge,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[groupaccessid,'emptygroupaccess','required'],
				[menuaccessid,'emptymenuaccess','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [menuaccessid,groupaccessid,isread,iswrite,ispost,isreject,isupload,isdownload,ispurge,datauser];
						if ((groupmenuid == null) || (groupmenuid == '')) {
							var sql = 'call Insertgroupmenu(?,?,?,?,?,?,?,?,?,?)';
						} else {
							var sql = 'call Updategroupmenu(?,?,?,?,?,?,?,?,?,?,?)';
							sqlarray = [groupmenuid].concat(sqlarray);
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
				[id,'emptygroupaccessid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgegroupaccess(?,?)';
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
						let sql = 'call Purgegroupmenu(?,?)';
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