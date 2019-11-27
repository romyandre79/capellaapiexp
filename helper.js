'use strict';

var connection = require('./config/db');
var log = require('./config/logger');
var response = require('./res');
var helper = require('./helper');
var languageid = 1;

exports.gettimeconvert = function (num)
{ 
    var n = new Date(num);
    return n.getHours() + ' hr ' + n.getMinutes() + ' min ' + n.getSeconds() + ' sec ';
}

exports.getsearchtext = function(value, defaultvalue, valuetype) {
    value = typeof value  !== 'undefined' ?  value  : defaultvalue;
    if (valuetype == 'int') {
        return value;
    } else {
        return '%'+String(value).replace(/ /gi,'%')+'%';
    }
};

exports.getcatalog = function(catalogname,callback) {
    catalogname = String(catalogname);
    if (catalogname.indexOf('ER_DUP_ENTRY') > -1) {
        catalogname = 'invalidduplicateentry';
    };
    catalogname = catalogname.replace(/ER_SIGNAL_EXCEPTION: /g,'');
    catalogname = catalogname.replace(/ER_PARSE_ERROR: /g,'');
    catalogname = catalogname.replace(/ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG: /g,'');
    catalogname = catalogname.replace(/ER_BAD_FIELD_ERROR: /g,'');
    catalogname = catalogname.replace(/ER_BAD_NULL_ERROR: /g,'');
    var sql = "select catalogval as katalog "+
    " from catalogsys a "+
    " where catalogname = ? and languageid = "+languageid;
    connection.query(sql,
        [catalogname],
		function (error, rows, fields){
			if(error){
                callback(error);
			} else {
                if (rows[0] == undefined) {
                    callback(catalogname);
                } else {
                    callback(rows[0].katalog);
                }
			}
        });
};

exports.getmessage = function (iserror,catalogname, res) {
    this.getcatalog(catalogname, function(msg) {
        if(iserror == true){
            log.error(msg);
            response.error(msg, res);
        } else {
            response.ok(msg, res);
        }
    });
}

exports.getoffset = function(page,rows,callback){
    var offset = 0;
    var sqloffset = ' limit ?,? ';
    if (Number(rows) != 0) {
        offset = (Number(page)-1) * Number(rows);
        sqloffset = " limit ?,? ";
	} 
    callback(offset,sqloffset);
};

exports.checkauthkey = function(token,callback) {
    var sql = "select ifnull(count(1),0) as jumlah "+
        " from useraccess "+
        " where authkey = ? ";
    connection.query(sql,
        [token],
		function (error, rows, fields){
			if(error){
                log.error(error);
                callback(error);
			} else {
                if (rows[0].jumlah == 0) {
                    callback('youarenotauthorized');
                } else {
                    callback('');
                }
			}
        });
};

exports.validatedata = function(data,callback) {
    var msg = '';
    data.forEach(function(item) {
        var iterator = item.values();
        var valuesource = iterator.next().value;
        var valueerror = iterator.next().value;
        var valuetype = iterator.next().value;
        if (valuetype == 'required') {
            if ((valuesource == '') || (valuesource == undefined)) {
                msg = valueerror;
            }
        } else 
        if (valuetype == 'numeric') {
            if (isNaN(valuesource) == true) {
                msg = valueerror;
            }
        } else 
        if (valuetype == 'clientdata') {
            if ((valuesource == '') || (valuesource == undefined)) {
                msg = valueerror;
            }
        }
    });
    helper.getcatalog(msg,function(error){
        callback(error);
    });
}

exports.checkdoc = function(wfname,res) {
    var sql = "select getwfmaxstatbywfname(?) as maxstat";
    connection.query(sql,
        [wfname],
		function (error, rows, fields){
			if(error){
                helper.getmessage(true, error.message, res);
			} else {
                if (rows[0] == undefined) {
                    helper.getmessage(true,'docflow', res);
                } else {
                    helper.getmessage(false, rows[0].maxstat,res);
                }
			}
        });
};

exports.getmenuauth = function(token,menuobject,callback) {
    var sql = "select ifnull(count(1),0) as gmauth "+
    " from groupmenuauth gm "+
    " inner join menuauth ma on ma.menuauthid = gm.menuauthid "+
    " inner join usergroup ug on ug.groupaccessid = gm.groupaccessid "+
    " inner join useraccess ua on ua.useraccessid = ug.useraccessid "+
    " where upper(ma.menuobject) = upper(?) "+
    " and lower(ua.authkey) = lower(?)";
    connection.query(sql,
        [menuobject,token],
		function (error, rows, fields){
			if(error){
                callback(error.message,0);
			} else {
                if (rows[0] == undefined) {
                    callback('',0);
                } else {
                    callback('', rows[0].gmauth);
                }
			}
        });
};

exports.login = function(username,password,callback) {
    var sql = 'select gettoken(?,md5(?)) as authkey ';
    connection.query(sql,
        [username,password],
		function (error, rows, fields){
			if(error){
                callback(error,0);
			} else {
                if (rows[0] == undefined) {
                    callback('',0);
                } else {
                    sql = 'select z.*,a.languagename,b.themename '+
                    ' from useraccess z '+
                    ' left join language a on a.languageid = z.languageid '+
                    ' left join theme b on b.themeid = z.themeid '+
                    ' where z.username = ? '+
                    ' and z.password = md5(?) ';
                    connection.query(sql,
                        [username,password],
                        function (error, rows, fields){
                            if(error){
                                callback(error,0);
                            } else {
                                if (rows[0] == undefined) {
                                    callback('youarenotauthorized',0);
                                } else {
                                    if (rows.length > 0) {
                                        callback('', rows[0]);
                                    } else {
                                        callback('youarenotauthorized',0);
                                    }       
                                }
                            }
                    });                
                }
			}
    });
};

exports.getuserfavs = function(token,callback) {
    var sql = "select distinct b.menuaccessid,b.menuname,getcatalogsys(b.menuname,c.languageid) as menulabel,b.description,b.menuurl,b.menuicon "+
    " from userfav a "+
    " join menuaccess b on b.menuaccessid = a.menuaccessid "+
    " join useraccess c on c.useraccessid = a.useraccessid "+
    " where c.authkey = ? ";
    connection.query(sql,
        [token],
		function (error, rows, fields){
			if(error){
                callback(error.message,0);
			} else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    callback('', rows);
                }
			}
        });
};

exports.getmenuitems = function(token,callback) {
    var sql = "select distinct a.menuicon,a.menuname, getcatalogsys(a.menuname,d.languageid) as menulabel, a.menuaccessid, a.description, a.menuurl,a.parentid,a.sortorder,a.description "+
    " from menuaccess a "+
    " join groupmenu b on b.menuaccessid = a.menuaccessid "+
    " join usergroup c on c.groupaccessid = b.groupaccessid "+
    " join useraccess d on d.useraccessid = c.useraccessid "+
    " where a.parentid is null and a.recordstatus = 1 and b.isread = 1 "+
    " and d.authkey = ? "+
    " order by a.sortorder ASC, a.description ASC ";
    connection.query(sql,
        [token],
		function (error, rows, fields){
			if(error){
                callback(error.message,0);
			} else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    callback('', rows);
                }
			}
        });
};

exports.getsubmenu = function(token,parentid,callback) {
    var sql = "select distinct t.menuaccessid,t.menuname,getcatalogsys(t.menuname,c.languageid) as menulabel,t.description,t.menuurl,t.menuicon "+
    " from menuaccess t "+
    " inner join groupmenu a on a.menuaccessid = t.menuaccessid "+
    " inner join usergroup b on b.groupaccessid = a.groupaccessid "+
    " inner join useraccess c on c.useraccessid = b.useraccessid "+
    " where t.parentid = ? and c.authkey = ? and a.isread = 1 and t.recordstatus = 1 and c.recordstatus = 1 "+
    " order by t.sortorder asc, t.description asc ";
    connection.query(sql,
        [parentid, token],
		function (error, rows, fields){
			if(error){
                callback(error.message,0);
			} else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    callback('', rows);
                }
			}
        });
};

exports.checkaccess = function(token,menuname,menuaction,callback) {
    var sql = "select "+menuaction+" as akses " +
    " from useraccess a "+
	" inner join usergroup b on b.useraccessid = a.useraccessid "+
	" inner join groupmenu c on c.groupaccessid = b.groupaccessid "+
	" inner join menuaccess d on d.menuaccessid = c.menuaccessid "+
	" where a.authkey = ? and lower(menuname) = lower(?) ";
    connection.query(sql,
        [token, menuname],
		function (error, rows, fields){
			if(error){
                callback(error.message,0);
			} else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    callback('', rows);
                }
			}
        });
};

exports.gethistorydata = function(token,menuname,tableid,callback) {
    helper.checkaccess(token,menuname,'iswrite',function(error,value){
        if (error != '') {
            callback(error,value);
        } else {
            var sql = "select t.* " +
            " from translog t "+
            " where (coalesce(menuname,'') = ?) "+
            " and (coalesce(tableid,'') = ?) ";
            connection.query(sql,
                [menuname,tableid],
                function (error, rows, fields){
                    if(error){
                        callback(error.message,0);
                    } else {
                        if (rows == undefined) {
                            callback('youarenotauthorized',0);
                        } else {
                            callback('', rows);
                        }
                    }
                });
        }
    })
};

exports.getdashboard = function(token,callback) {
    var sql = "select distinct d.widgetname,d.widgettitle,d.widgeturl,a.dashgroup,a.webformat,a.position, ( "+
        " select count(1) "+
        " from userdash d0 "+
        " where d0.dashgroup = a.dashgroup and d0.menuaccessid = a.menuaccessid and d0.groupaccessid = b.groupaccessid "+
        " ) dashcount "+
        " from userdash a "+
        " join usergroup b on b.groupaccessid = a.groupaccessid "+
        " join useraccess c on c.useraccessid = b.useraccessid "+
        " join widget d on d.widgetid = a.widgetid "+
        " join menuaccess e on e.menuaccessid = a.menuaccessid "+ 
        " where lower(menuname) = lower('dashboard') and c.authkey = ? "+
        " order by dashgroup asc, position asc ";
    connection.query(sql,
        [token],
        function (error, rows, fields){
            if(error){
                callback(error.message,0);
            } else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    callback('', rows);
                }
            }
        });
};

exports.getuserobjectvalues = function(token,menuobject,callback) {
    var sql = "select distinct a.menuvalueid "+
    " from groupmenuauth a "+
    " inner join menuauth b on b.menuauthid = a.menuauthid "+
    " inner join usergroup c on c.groupaccessid = a.groupaccessid "+
    " inner join useraccess d on d.useraccessid = c.useraccessid "+
    " inner join wfgroup e on e.groupaccessid = a.groupaccessid "+
    " inner join workflow f on f.workflowid = e.workflowid "+
    " where b.menuobject = ? "+
    " and d.authkey = ? ";
    connection.query(sql,
        [menuobject,token],
        function (error, rows, fields){
            if(error){
                callback(error.message,0);
            } else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    if (rows.length > 0) {
                        //callback('', rows);
                        var cid = '';
                        rows.forEach(function(item,index,array){
                            if (cid == '') {
                                cid = item['menuvalueid'];
                            } else 
                            if (cid != '') {
                                cid = cid + ','+item['menuvalueid'];
                            }
                        });
                        callback('',cid);
                    } else {
                        callback('youarenotauthorized',0);
                    }
                }
            }
        });
};

exports.getusertodo = function(token,page,rows,sort,order,res) {
    var plantid = null;
    helper.getuserobjectvalues(token,'plant',function(error,value){
        if (error != ''){
            helper.getmessage(true,error,res);
        } else {
            plantid = value;
            var sqlcount = " select count(1) as total ";
            var sqlselect = "select distinct a.usertodoid,a.tododate,a.menuname,a.docno,a.description ";
            var wherearray = [plantid,token];
            var sqlfrom = 
            " from usertodo a "+
            " inner join useraccess b on b.useraccessid = a.useraccessid "+
            " where plantid = ? "+
            " and isread = 0 "+
            " and b.authkey = ? ";
            var sqlorder = " order by ? ? ";
            var sqlqcount = sqlcount + sqlfrom;
            var result = {
                total:0,
                rows:{}
            };
			connection.query(sqlqcount,
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
            wherearray.push(sort,order,offset,rows);
            var sqlq = sqlselect + sqlfrom + sqlorder + sqloffset;
            connection.query(sqlq,
                wherearray,
                function (error, rows, fields){
                    if(error){
                        helper.getmessage(true,error.message,res);
                    } else {
                        if (rows == undefined) {
                            helper.getmessage(true,'youarenotauthorized',res);
                        } else {
                            result['rows'] = rows;
                            response.senddata(result['total'],result['rows'],res);
                        }
                    }
                });
        }
    });
};

exports.findstatusbyuser = function(token,wfname,callback) {
    var sql = "select b.wfbefstat "+
    " from workflow a "+
    " inner join wfgroup b on b.workflowid = a.workflowid "+
    " inner join groupaccess c on c.groupaccessid = b.groupaccessid "+
    " inner join usergroup d on d.groupaccessid = c.groupaccessid "+
    " inner join useraccess e on e.useraccessid = d.useraccessid "+
    " where upper(a.wfname) = upper(?) and e.authkey=? "+
    " order by b.wfbefstat asc limit 1 ";
    connection.query(sql,
        [wfname,token],
        function (error, rows, fields){
            if(error){
                callback(error.message,0);
            } else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    if (rows[0] == undefined) {
                        callback('youarenotauthorized',0);
                    } else {
                        callback('', rows[0].wfbefstat);
                    }
                }
            }
        });
};

exports.getuserobjectwfvalues = function(token,menuobject,workflow,callback) {
    var sql = "select distinct a.menuvalueid "+
    " from groupmenuauth a "+
    " inner join menuauth b on b.menuauthid = a.menuauthid "+
    " inner join usergroup c on c.groupaccessid = a.groupaccessid "+ 
    " inner join useraccess d on d.useraccessid = c.useraccessid "+ 
    " inner join wfgroup e on e.groupaccessid = a.groupaccessid "+
    " inner join workflow f on f.workflowid = e.workflowid "+
    " where b.menuobject = ? "+
    " and d.authkey = ? "+
    " and c.groupaccessid in (select l.groupaccessid "+
    " from wfgroup j "+
    " join workflow k on k.workflowid=j.workflowid "+
    " join usergroup l on l.groupaccessid=j.groupaccessid "+
    " where k.wfname = ? "+
    " and l.useraccessid=d.useraccessid) ";
    connection.query(sql,
        [menuobject,token,workflow],
        function (error, rows, fields){
            if(error){
                callback(error.message,0);
            } else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    if (rows.length > 0) {
                        var cid = '';
                        rows.forEach(function(item,index,array){
                            if (cid == '') {
                                cid = item['menuvalueid'];
                            } else 
                            if (cid != '') {
                                cid = cid + ','+item['menuvalueid'];
                            }
                        });
                        callback('',cid);
                    } else {
                        callback('youarenotauthorized',0);
                    }
                }
            }
        });
};

exports.findstatusname = function(token,wfname,recordstatus,callback) {
    var sql = "select wfstatusname "+
    " from wfstatus a "+
    " inner join workflow b on b.workflowid = a.workflowid "+
    " where b.wfname = ? and a.wfstat = ? ";
    connection.query(sql,
        [wfname,recordstatus],
        function (error, rows, fields){
            if(error){
                callback(error.message,0);
            } else {
                if (rows == undefined) {
                    callback('youarenotauthorized',0);
                } else {
                    if (rows[0] == undefined) {
                        callback('youarenotauthorized',0);
                    } else {
                        callback('', rows[0].wfstatusname);
                    }
                }
            }
        });
};