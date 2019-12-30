'use strict';

var log = require('../../config/logger');
var response = require('../../res');
var connection = require('../../config/db');
var helper = require('../../helper');
var sqlselect = "SELECT a.*,b.languagename,c.themename, (select count(1) from usergroup z where z.useraccessid = a.useraccessid) as jumlah ";
var sqlfrom =
	"FROM useraccess a "+
	"left join language b on b.languageid = a.languageid "+
	"left join theme c on c.themeid = a.themeid ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.useraccessid,'') like ? "+
	" and coalesce(a.username,'') like ? "+
	" and coalesce(a.realname,'') like ? "+
	" and coalesce(a.email,'') like ? "+
	" and coalesce(a.phoneno,'') like ? "+
	" and coalesce(b.languagename,'') like ? "+
	" and coalesce(c.themename,'') like ? ";
var sqlwherecombo = " where coalesce(a.useraccessid,'') like ? "+
	" or coalesce(a.username,'') like ? "+
	" or coalesce(a.realname,'') like ? "+
	" or coalesce(a.email,'') like ? "+
	" or coalesce(a.phoneno,'') like ? "+
	" or coalesce(b.languagename,'') like ? "+
	" or coalesce(c.themename,'') like ? ";
var sqlwheregroupin = " and useraccessid in ( "+
	" select distinct useraccessid "+
	" from usergroup z "+
	" left join groupaccess zz on zz.groupaccessid = z.groupaccessid "+
	" where coalesce(zz.groupname,'') like ? "+
	" )";
var sqlorder = " order by ";
var sqlselectusergroup = "select a.usergroupid,c.groupaccessid,c.groupname ";
var sqlfromusergroup = " FROM usergroup a "+
	" left join groupaccess c on c.groupaccessid = a.groupaccessid ";
var sqlwhereusergroup = " where a.useraccessid = ?";
var result = {
	total:0,
	rows:{}
};

exports.index = async function(req, res){
	res.send("User Access API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		useraccessid = helper.getsearchtext(req.body.useraccessid,'','string'),
		username = helper.getsearchtext(req.body.username,'','string'),
		realname = helper.getsearchtext(req.body.realname,'','string'),
		email = helper.getsearchtext(req.body.email,'','string'),
		phoneno = helper.getsearchtext(req.body.phoneno,'','string'),
		languagename = helper.getsearchtext(req.body.languagename,'','string'),
		themename = helper.getsearchtext(req.body.themename,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			if (id != '') {
				sqlw = sqlw + " and useraccessid in ("+id+")";
			}
			if (groupname != '%%') {
				sqlw = sqlw + sqlwheregroupin;
			}
			var sqlq = sqlselect + sqlfrom + sqlw + sqlorder + sort;
			connection.query(sqlq,
				[useraccessid,username,realname,email,phoneno,languagename,themename],
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
	var token = req.body.token;
	var useraccessid = helper.getsearchtext(req.body.useraccessid,'','string'),
		username = helper.getsearchtext(req.body.username,'','string'),
		realname = helper.getsearchtext(req.body.realname,'','string'),
		email = helper.getsearchtext(req.body.email,'','string'),
		phoneno = helper.getsearchtext(req.body.phoneno,'','string'),
		languagename = helper.getsearchtext(req.body.languagename,'','string'),
		themename = helper.getsearchtext(req.body.themename,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
			var wherearray = [useraccessid,username,realname,email,phoneno,languagename,themename];
			if (groupname != '%%') {
				sqlw = sqlwhere + sqlwheregroupin;
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
							result.rows = rows;
							if (error) {
								helper.getmessage(true,error.message,res);
							} else {
								response.senddata(result['total'],result.rows,res);
							}
						});	
				});
		}
	});	
};

exports.listusergroup = async function(req, res) {
	var token = req.body.token;
	var id = req.body.id,
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rows = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var wherearray = [id];
			var sqlq = sqlcount + sqlfromusergroup + sqlwhereusergroup;
			connection.query(sqlq,
				wherearray,
				function (error, rows, fields){
					if (error != undefined) {
						helper.getmessage(true,error.message,res);
					}
					result['total'] = rows[0].total;
				});		
			var offset = '';
			var sqloffset = '';
			helper.getoffset(page,rows,function(retoffset,retsqloffset){
				offset = retoffset;
				sqloffset = retsqloffset;
			});
			var sqlq = sqlselectusergroup + sqlfromusergroup + sqlwhereusergroup + sqlorder + sort + sqloffset;	
			wherearray.push(offset,rows);
			connection.query(sqlq,
				wherearray,
				function (error, rows, fields){
					result.rows = rows;
					if (error) {
						helper.getmessage(true,error.message,res);
					} else {
						response.senddata(result['total'],result.rows,res);
					}
				});		
		}
	});	
};

exports.listcombo = async function(req, res) {
	var token = req.body.token,
		useraccessid = helper.getsearchtext(req.body.useraccessid,'','string'),
		username = helper.getsearchtext(req.body.username,'','string'),
		realname = helper.getsearchtext(req.body.realname,'','string'),
		email = helper.getsearchtext(req.body.email,'','string'),
		phoneno = helper.getsearchtext(req.body.phoneno,'','string'),
		languagename = helper.getsearchtext(req.body.languagename,'','string'),
		themename = helper.getsearchtext(req.body.themename,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlq = sqlselect + sqlfrom + sqlwherecombo + " and a.recordstatus = 1 " + sqlorder + sort;
			connection.query(sqlq,
				[useraccessid,username,realname,email,phoneno,languagename,themename,groupname],
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
			var sqlq = sqlselect + sqlfrom + 
			" where a.useraccessid = ?";
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

exports.saveprofile = async function(req, res) {
	var token = req.body.token,
	useraccessid = req.body.useraccessid,
	username = req.body.username,
	realname = req.body.realname,
	password = req.body.password,
	email = req.body.email,
	phoneno = req.body.phoneno,
	languageid = req.body.languageid,
	themeid = req.body.themeid,
	datauser = req.body.datauser;
	log.info(req.body);
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			var sql = 'call Modifuserprofile(?,?,?,?,?,?,?,?,?);';
			connection.query(sql,
				[useraccessid, username, realname, password, email, phoneno, languageid, themeid, datauser],
				function (error, rows, fields) {
					if (error) {
						helper.getmessage(true, error.message, res);
					} else {
						helper.getmessage(false, 'alreadysaved', res);
					}
				});
		}
	});
};

exports.save = async function(req, res) {
	var token = req.body.token,
	useraccessid = req.body.useraccessid,
	username = req.body.username,
	realname = req.body.realname,
	password = req.body.password,
	email = req.body.email,
	phoneno = req.body.phoneno,
	languageid = req.body.languageid,
	themeid = req.body.themeid,
	recordstatus = req.body.recordstatus,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[username,'emptyusername','required'],
				[realname,'emptyrealname','required'],
				[password,'emptypassword','required'],
				[email,'emptyemail','required'],
				[phoneno,'emptyphoneno','required'],
				[languageid,'emptylanguage','required'],
				[themeid,'emptytheme','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						if ((useraccessid == null) || (useraccessid == '')) {
							useraccessid = -1;
						}
						let sql = 'call Modifuseraccess(?,?,?,?,?,?,?,?,?,?);';
						connection.query(sql,
						[ useraccessid, username, realname, password, email, phoneno, languageid, themeid, recordstatus, datauser ], 
						function (error, rows, fields){
							if (error) {
								helper.getmessage(true,error.message,res);
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

exports.saveusergroup = async function(req, res) {
	var token = req.body.token,
	usergroupid = req.body.usergroupid,
	useraccessid = req.body.useraccessid,
	groupaccessid = req.body.groupaccessid,
	datauser = req.body.datauser;
	log.error(req.body);
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[useraccessid,'emptyuseraccess','required'],
				[groupaccessid,'emptygroupaccess','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [useraccessid,groupaccessid,datauser];
						if ((usergroupid == null) || (usergroupid == '')) {
							var sql = 'call Insertusergroup(?,?,?)';
						} else {
							var sql = 'call Updateusergroup(?,?,?,?)';
							sqlarray = [usergroupid].concat(sqlarray);
						}
						connection.query(sql,
						sqlarray, 
						function (error, rows, fields){
							if (error) {
								helper.getmessage(true,error.message,res);
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
				[id,'emptyuseraccess','required'],
				[id,'useraccessnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeuseraccess(?,?)';
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

exports.purgeusergroup = async function(req, res) {
	var token = req.body.token,
	id = req.body.id,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[id,'emptyusergroup','required'],
				[id,'usergroupnumeric','numeric'],
				[datauser,'emptydatauser','required'],
				[datauser,'datausernotcomplete','clientdata'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeusergroup(?,?)';
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