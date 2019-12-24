'use strict';

var helper = require('../helper');
var response = require('../res');
var os = require('os');
var wincpu = require('windows-cpu');
var result = {};
  
exports.serverinfo = async function(req,res){
    var platform = '';
    switch (os.platform()) {
        case 'win32' :
            platform = 'Microsoft Windows';
            var osrelease = os.release();
            switch (osrelease.substr(1,3)) {
                case '5.1':
                    platform = platform + ' XP';
                    break;
                case '5.2':
                    platform = platform + ' XP Professional x64';
                    break;
                case '6.0':
                    platform = platform + ' Vista';
                    break;
                case '6.1':
                    platform = platform + ' 7';
                    break;
                case '6.2':
                    platform = platform + ' 8';
                    break;
                case '6.3':
                    platform = platform + ' 8.1';
                    break;
                case '10.0':
                    platform = platform + ' 8.1';
                    break;
            }
            platform = platform + ' ' + os.arch();
            break;
        case 'linux':
            platform = 'Linux';
            break;
        case 'freebsd':
            platform = 'Free BSD';
            break;
        case 'openbsd':
            platform = 'Open BSD';
            break;
        case 'Darwin':
            platform = 'Darwin';
            break;
        case 'Sun OS':
            platform = 'Sun OS';
            break;
        default :
            platform = os.platform();
    }
    result = {
        hostname : os.hostname(),
        osname : platform,
        kernelversion : os.release(),
        loadavg : os.loadavg(),
        uptime : helper.gettimeconvert(os.uptime()),
        networks : os.networkInterfaces(),
        processor : os.cpus(),
        memory : {
            physical : {
                total : os.totalmem(),
                free: os.freemem(),
                used : os.totalmem() - os.freemem(),
                percent : (os.totalmem() - os.freemem()) / (os.totalmem()) * 100
            }
        }
    }
    response.senddata(result.length,result,res);
}

exports.getcatalog = async function(req,res){
    var messages = req.body.messages;
    helper.getcatalog(messages,function(error){
        response.sendmsg(0,error,res);
    });
}

exports.getmessage = async function(req, res){
    var iserror = req.body.iserror,
    messages = req.body.messages;
    helper.getmessage(iserror,messages,res);
}

exports.checkaccess = async function(req, res){
    var token = req.body.token,
        menuname = req.body.menuname,
        menuaction = req.body.menuaction;
    helper.checkaccess(token,menuname,menuaction,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }
    });
}

exports.checkdoc = async function(req,res){
    var wfname = req.body.wfname;
    helper.checkdoc(wfname,res);
}

exports.login = async function(req,res){
    var username = req.body.username,
    password = req.body.password;
    helper.login(username,password,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            if (value != 0) {
                response.senddata(1,value,res);
            } else {
                helper.getmessage(true,error,res);
            }
        }
    });
}

exports.getmenuauth = async function(req,res){
    var token = req.body.token,
    menuobject = req.body.menuobject;
    helper.getmenuauth(token,menuobject,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.sendmsg(1,value,res);
        }  
    })
}

exports.getuserfavs = async function(req,res){
    var token = req.body.token;
    helper.getuserfavs(token,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getmenuitems = async function(req,res){
    var token = req.body.token;
    helper.getmenuitems(token,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getallmenus = async function(req,res){
    var token = req.body.token;
    helper.getallmenus(token,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getsubmenu = async function(req,res){
    var token = req.body.token,
    parentid = req.body.parentid;
    helper.getsubmenu(token,parentid,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.gethistorydata = async function(req,res){
    var token = req.body.token,
    menuname = req.body.menuname,
    tableid = req.body.tableid;
    helper.gethistorydata(token,menuname,tableid,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getdashboard = async function(req,res){
    var token = req.body.token;
    helper.getdashboard(token,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getuserobjectvalues = async function(req,res){
    var token = req.body.token,
    menuobject = req.body.menuobject;
    helper.getuserobjectvalues(token,menuobject,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getusertodo = async function(req,res){
    var token = req.body.token,
    page = Number(helper.getsearchtext(req.body.page,'1','int')),
    rows = Number(helper.getsearchtext(req.body.rows,'10','int')),
    sort = helper.getsearchtext(req.body.sort,'a.usertodoid','int'),
    order = helper.getsearchtext(req.body.order,'desc','int');
    helper.getusertodo(token,page,rows,sort,order,res);
}

exports.findstatusbyuser = async function(req,res){
    var token = req.body.token,
    wfname = req.body.wfname;
    helper.findstatusbyuser(token,wfname,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.getuserobjectwfvalues = async function(req,res){
    var token = req.body.token,
    workflow = req.body.workflow,
    menuobject = req.body.menuobject;
    helper.getuserobjectwfvalues(token,menuobject,workflow,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}

exports.findstatusname = async function(req,res){
    var token = req.body.token,
    wfname = req.body.wfname,
    recordstatus = req.body.recordstatus;
    helper.findstatusname(token,wfname,recordstatus,function(error,value){
        if (error != '') {
            helper.getmessage(true,error,res);
        } else {
            response.senddata(value.length,value,res);
        }  
    })
}