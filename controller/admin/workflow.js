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
	"FROM workflow a ";
var sqlcount = "SELECT count(1) as total ";
var sqlwhere = " where coalesce(a.workflowid,'') like ? "+
    " and coalesce(a.wfname,'') like ? "+
    " and coalesce(a.wfdesc,'') like ? "+
    " and coalesce(a.wfminstat,'') like ? "+
    " and coalesce(a.wfmaxstat,'') like ? ";
var sqlwherecombo = " where coalesce(a.workflowid,'') like ? "+
    " or coalesce(a.wfname,'') like ? "+
    " or coalesce(a.wfdesc,'') like ? "+
    " or coalesce(a.wfminstat,'') like ? "+
    " or coalesce(a.wfmaxstat,'') like ? ";
var sqlorder = " order by ";
var sqlselect1 = "select t.*,q.groupname ";
var sqlfrom1 = " from wfgroup t "+
    " left join groupaccess q on q.groupaccessid = t.groupaccessid ";
var sqlwhere1 = " where t.workflowid = ?";
var sqlselect2 = "select t.* ";
var sqlfrom2 = " from wfstatus t ";
var sqlwhere2 = " where t.workflowid = ?";

exports.index = async function(req, res){
	res.send("Workflow API Index");
}

exports.listall = async function(req, res) {
	var token = req.body.token,
		id = req.body.id,
		workflowid = helper.getsearchtext(req.body.workflowid,'','string'),
		wfname = helper.getsearchtext(req.body.wfname,'','string'),
		wfdesc = helper.getsearchtext(req.body.wfdesc,'','string'),
		wfminstat = helper.getsearchtext(req.body.wfminstat,'','string'),
		wfmaxstat = helper.getsearchtext(req.body.wfmaxstat,'','string'),
		groupname = helper.getsearchtext(req.body.groupname,'','string'),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere;
            var wherearray = [workflowid,wfname,wfdesc,wfminstat,wfmaxstat];
			if (id != '') {
				sqlw = sqlw + " and workflowid in ("+id+") ";
            }
            if (groupname != '%%') {
                sqlw = sqlw + " and workflowid in ( "+
                    " select distinct workflowid "+
                    " from wfgroup z "+
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
        workflowid = helper.getsearchtext(req.body.workflowid,'','string'),
        wfname = helper.getsearchtext(req.body.wfname,'','string'),
        wfdesc = helper.getsearchtext(req.body.wfdesc,'','string'),
        wfminstat = helper.getsearchtext(req.body.wfminstat,'','string'),
        wfmaxstat = helper.getsearchtext(req.body.wfmaxstat,'','string'),
        groupname = helper.getsearchtext(req.body.groupname,'','string'),
        page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
			var sqlw = sqlwhere;
            var wherearray = [workflowid,wfname,wfdesc,wfminstat,wfmaxstat];
            if (groupname != '%%') {
                sqlw = sqlw + " and workflowid in ( "+
                    " select distinct z.workflowid "+
                    " from wfgroup z "+
                    " left join groupaccess za on za.groupaccessid = z.groupaccessid "+
                    " where coalesce(za.groupname,'') like ? )";
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
        workflowid = req.body.workflowid,
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere1;
            var wherearray = [workflowid]
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

exports.list2 = async function(req, res) {
    var token = req.body.token,
        workflowid = req.body.workflowid,
		page = Number(helper.getsearchtext(req.body.page,'1','int')),
		rowsn = Number(helper.getsearchtext(req.body.rows,'10','int')),
		sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwhere2;
            var wherearray = [workflowid]
			var sqlq = sqlcount + sqlfrom2 + sqlw;
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
					var sqlq = sqlselect2 + sqlfrom2 + sqlw + sqlorder + sort + sqloffset;	
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
        workflowid = helper.getsearchtext(req.body.workflowid,'','string'),
        wfname = helper.getsearchtext(req.body.wfname,'','string'),
        wfdesc = helper.getsearchtext(req.body.wfdesc,'','string'),
        wfminstat = helper.getsearchtext(req.body.wfminstat,'','string'),
        wfmaxstat = helper.getsearchtext(req.body.wfmaxstat,'','string'),
        groupname = helper.getsearchtext(req.body.groupname,'','string'),
        sort = req.body.sort;
	helper.checkauthkey(token,function(error){
		if (error != ''){
			helper.getmessage(true,error,res);
		} else {
            var sqlw = sqlwherecombo;
            var wherearray = [workflowid,wfname,wfdesc,wfminstat,wfmaxstat];
            if (groupname != '%%') {
                sqlw = sqlw + " or workflowid in ( "+
                    " select distinct workflowid "+
                    " from wfgroup z "+
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
			var sqlq = sqlselect + sqlfrom + " where a.workflowid = ?";
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
	workflowid = req.body.workflowid,
	wfname = req.body.wfname,
	wfdesc = req.body.wfdesc,
	wfminstat = req.body.wfminstat,
	wfmaxstat = req.body.wfmaxstat,
	recordstatus = req.body.recordstatus,
    datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[wfname,'emptywfname','required'],
				[wfdesc,'emptywfdesc','required'],
				[wfminstat,'emptywfminstat','required'],
				[wfmaxstat,'emptywfmaxstat','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
                        var sqlarray = [workflowid,wfname,wfdesc,wfminstat,wfmaxstat,recordstatus,datauser];
                        var sql = 'call Modifworkflow(?,?,?,?,?,?,?)';
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
	wfgroupid = req.body.wfgroupid,
	workflowid = req.body.workflowid,
	groupaccessid = req.body.groupaccessid,
	wfbefstat = req.body.wfbefstat,
	wfrecstat = req.body.wfrecstat,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[workflowid,'emptyworkflow','required'],
				[groupaccessid,'emptygroupaccess','required'],
				[wfbefstat,'emptywfbefstat','required'],
				[wfrecstat,'emptywfrecstat','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [workflowid,groupaccessid,wfbefstat,wfrecstat,datauser];
						if ((wfgroupid == null) || (wfgroupid == '')) {
							var sql = 'call Insertwfgroup(?,?,?,?,?)';
						} else {
							var sql = 'call Updatewfgroup(?,?,?,?,?,?)';
							sqlarray = [wfgroupid].concat(sqlarray);
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

exports.save2 = async function(req, res) {
	var token = req.body.token,
	wfstatusid = req.body.wfstatusid,
	workflowid = req.body.workflowid,
	wfstat = req.body.wfstat,
	wfstatusname = req.body.wfstatusname,
	backcolor = req.body.backcolor,
	fontcolor = req.body.fontcolor,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[workflowid,'emptyworkflow','required'],
				[wfstat,'emptywfstat','required'],
				[wfstatusname,'emptywfstatusname','required'],
				[backcolor,'emptybackcolor','required'],
				[fontcolor,'emptyfontcolor','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						var sqlarray = [workflowid,wfstat,wfstatusname,backcolor,fontcolor,datauser];
						if ((wfstatusid == null) || (wfstatusid == '')) {
							var sql = 'call Insertwfstatus(?,?,?,?,?,?)';
						} else {
							var sql = 'call Updatewfstatus(?,?,?,?,?,?,?)';
							sqlarray = [wfstatusid].concat(sqlarray);
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
				[id,'emptyworkflowid','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgeworkflow(?,?)';
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
				[id,'emptywfgroup','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgewfgroup(?,?)';
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

exports.purge2 = async function(req, res) {
	var token = req.body.token,
	id = req.body.id,
	datauser = req.body.datauser;
	helper.checkauthkey(token,function(error){
		if (error != '') {
			helper.getmessage(true,error,res);
		} else {
			helper.validatedata([
				[id,'emptywfstatus','required'],
				],
				function(error){
					if (error != '') {
						helper.getmessage(true,error,res);
					} else {
						let sql = 'call Purgewfstatus(?,?)';
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