'use strict';

module.exports = function(app) {
	var useraccess = require('./controller/admin/useraccess'),
	site = require('./controller/site'),
	sysadm = require('./controller/sysadm'),
	language = require('./controller/admin/language'),
	country = require('./controller/admin/country'),
	province = require('./controller/admin/province'),
	city = require('./controller/admin/city'),
	modules = require('./controller/admin/modules'),
	currency = require('./controller/admin/currency'),
	parameter = require('./controller/admin/parameter'),
	catalogsys = require('./controller/admin/catalogsys'),
	widget = require('./controller/admin/widget'),
	menuaccess = require('./controller/admin/menuaccess'),
	groupaccess = require('./controller/admin/groupaccess'),
	menuauth = require('./controller/admin/menuauth'),
	snro = require('./controller/admin/snro'),
	workflow = require('./controller/admin/workflow'),
	userdash = require('./controller/admin/userdash'),
	company = require('./controller/admin/company'),
	translog = require('./controller/admin/translog'),
	usertodo = require('./controller/admin/usertodo'),
	theme = require('./controller/admin/theme'),
	productstock = require('./controller/warehouse/productstock'),
	deliveryschedule = require('./controller/warehouse/deliveryschedule'),
	rawschedule = require('./controller/purchasing/rawschedule'),
	periodicsales = require('./controller/order/periodicsales'),
	comparesogi = require('./controller/order/comparesogi'),
	productionschedule = require('./controller/production/productionschedule');

	app.route('/').get(site.index);

	app.route('/sysadm/serverinfo').post(sysadm.serverinfo);
	app.route('/sysadm/getcatalog').post(sysadm.getcatalog);
	app.route('/sysadm/getmessage').post(sysadm.getmessage);
	app.route('/sysadm/checkdoc').post(sysadm.checkdoc);
	app.route('/sysadm/login').post(sysadm.login);
	app.route('/sysadm/getmenuauth').post(sysadm.getmenuauth);
	app.route('/sysadm/getuserfavs').post(sysadm.getuserfavs);
	app.route('/sysadm/getmenuitems').post(sysadm.getmenuitems);
	app.route('/sysadm/getsubmenu').post(sysadm.getsubmenu);
	app.route('/sysadm/checkaccess').post(sysadm.checkaccess);
	app.route('/sysadm/gethistorydata').post(sysadm.gethistorydata);
	app.route('/sysadm/getdashboard').post(sysadm.getdashboard);
	app.route('/sysadm/getuserobjectvalues').post(sysadm.getuserobjectvalues);
	app.route('/sysadm/getusertodo').post(sysadm.getusertodo);
	app.route('/sysadm/findstatusbyuser').post(sysadm.findstatusbyuser);
	app.route('/sysadm/getuserobjectwfvalues').post(sysadm.getuserobjectwfvalues);
	app.route('/sysadm/findstatusname').post(sysadm.findstatusname);

	app.route('/language').get(language.index);
	app.route('/language/listall').post(language.listall);
	app.route('/language/list').post(language.list);
	app.route('/language/listcombo').post(language.listcombo);
	app.route('/language/one').post(language.one);
	app.route('/language/save').post(language.save);
	app.route('/language/purge').post(language.purge);

	app.route('/country').get(country.index);
	app.route('/country/listall').post(country.listall);
	app.route('/country/list').post(country.list);
	app.route('/country/listcombo').post(country.listcombo);
	app.route('/country/one').post(country.one);
	app.route('/country/save').post(country.save);
	app.route('/country/purge').post(country.purge);

	app.route('/province').get(province.index);
	app.route('/province/listall').post(province.listall);
	app.route('/province/list').post(province.list);
	app.route('/province/listcombo').post(province.listcombo);
	app.route('/province/one').post(province.one);
	app.route('/province/save').post(province.save);
	app.route('/province/purge').post(province.purge);

	app.route('/city').get(city.index);
	app.route('/city/listall').post(city.listall);
	app.route('/city/list').post(city.list);
	app.route('/city/listcombo').post(city.listcombo);
	app.route('/city/one').post(city.one);
	app.route('/city/save').post(city.save);
	app.route('/city/purge').post(city.purge);

	app.route('/modules').get(modules.index);
	app.route('/modules/listall').post(modules.listall);
	app.route('/modules/list').post(modules.list);
	app.route('/modules/listcombo').post(modules.listcombo);
	app.route('/modules/one').post(modules.one);
	app.route('/modules/save').post(modules.save);
	app.route('/modules/purge').post(modules.purge);

	app.route('/currency').get(currency.index);
	app.route('/currency/listall').post(currency.listall);
	app.route('/currency/list').post(currency.list);
	app.route('/currency/listcombo').post(currency.listcombo);
	app.route('/currency/one').post(currency.one);
	app.route('/currency/save').post(currency.save);
	app.route('/currency/purge').post(currency.purge);

	app.route('/useraccess').get(useraccess.index);
	app.route('/useraccess/list').post(useraccess.list);
	app.route('/useraccess/listusergroup').post(useraccess.listusergroup);
	app.route('/useraccess/listcombo').post(useraccess.listcombo);
	app.route('/useraccess/listall').post(useraccess.listall);	
	app.route('/useraccess/one').post(useraccess.one);
	app.route('/useraccess/profile').post(useraccess.profile);
	app.route('/useraccess/save').post(useraccess.save);
	app.route('/useraccess/saveusergroup').post(useraccess.saveusergroup);
	app.route('/useraccess/purge').post(useraccess.purge);
	app.route('/useraccess/purgeusergroup').post(useraccess.purgeusergroup);	

	app.route('/theme').get(theme.index);
	app.route('/theme/listall').post(theme.listall);
	app.route('/theme/list').post(theme.list);
	app.route('/theme/listcombo').post(theme.listcombo);
	app.route('/theme/one').post(theme.one);
	app.route('/theme/save').post(theme.save);
	app.route('/theme/purge').post(theme.purge);

	app.route('/parameter').get(parameter.index);
	app.route('/parameter/listall').post(parameter.listall);
	app.route('/parameter/list').post(parameter.list);
	app.route('/parameter/listcombo').post(parameter.listcombo);
	app.route('/parameter/one').post(parameter.one);
	app.route('/parameter/save').post(parameter.save);
	app.route('/parameter/purge').post(parameter.purge);

	app.route('/catalogsys').get(catalogsys.index);
	app.route('/catalogsys/listall').post(catalogsys.listall);
	app.route('/catalogsys/list').post(catalogsys.list);
	app.route('/catalogsys/listcombo').post(catalogsys.listcombo);
	app.route('/catalogsys/one').post(catalogsys.one);
	app.route('/catalogsys/save').post(catalogsys.save);
	app.route('/catalogsys/purge').post(catalogsys.purge);

	app.route('/widget').get(widget.index);
	app.route('/widget/listall').post(widget.listall);
	app.route('/widget/list').post(widget.list);
	app.route('/widget/listcombo').post(widget.listcombo);
	app.route('/widget/one').post(widget.one);
	app.route('/widget/save').post(widget.save);
	app.route('/widget/purge').post(widget.purge);

	app.route('/menuaccess').get(menuaccess.index);
	app.route('/menuaccess/listall').post(menuaccess.listall);
	app.route('/menuaccess/list').post(menuaccess.list);
	app.route('/menuaccess/listcombo').post(menuaccess.listcombo);
	app.route('/menuaccess/one').post(menuaccess.one);
	app.route('/menuaccess/save').post(menuaccess.save);
	app.route('/menuaccess/purge').post(menuaccess.purge);

	app.route('/groupaccess').get(groupaccess.index);
	app.route('/groupaccess/listall').post(groupaccess.listall);
	app.route('/groupaccess/list').post(groupaccess.list);
	app.route('/groupaccess/list1').post(groupaccess.list1);
	app.route('/groupaccess/listcombo').post(groupaccess.listcombo);
	app.route('/groupaccess/one').post(groupaccess.one);
	app.route('/groupaccess/save').post(groupaccess.save);
	app.route('/groupaccess/save1').post(groupaccess.save1);
	app.route('/groupaccess/purge').post(groupaccess.purge);
	app.route('/groupaccess/purge1').post(groupaccess.purge1);

	app.route('/menuauth').get(menuauth.index);
	app.route('/menuauth/listall').post(menuauth.listall);
	app.route('/menuauth/list').post(menuauth.list);
	app.route('/menuauth/list1').post(menuauth.list1);
	app.route('/menuauth/listcombo').post(menuauth.listcombo);
	app.route('/menuauth/one').post(menuauth.one);
	app.route('/menuauth/save').post(menuauth.save);
	app.route('/menuauth/save1').post(menuauth.save1);
	app.route('/menuauth/purge').post(menuauth.purge);
	app.route('/menuauth/purge1').post(menuauth.purge1);

	app.route('/snro').get(snro.index);
	app.route('/snro/listall').post(snro.listall);
	app.route('/snro/list').post(snro.list);
	app.route('/snro/list1').post(snro.list1);
	app.route('/snro/listcombo').post(snro.listcombo);
	app.route('/snro/one').post(snro.one);
	app.route('/snro/save').post(snro.save);
	app.route('/snro/save1').post(snro.save1);
	app.route('/snro/purge').post(snro.purge);
	app.route('/snro/purge1').post(snro.purge1);

	app.route('/workflow').get(workflow.index);
	app.route('/workflow/listall').post(workflow.listall);
	app.route('/workflow/list').post(workflow.list);
	app.route('/workflow/list1').post(workflow.list1);
	app.route('/workflow/list2').post(workflow.list2);
	app.route('/workflow/listcombo').post(workflow.listcombo);
	app.route('/workflow/one').post(workflow.one);
	app.route('/workflow/save').post(workflow.save);
	app.route('/workflow/save1').post(workflow.save1);
	app.route('/workflow/save2').post(workflow.save2);
	app.route('/workflow/purge').post(workflow.purge);
	app.route('/workflow/purge1').post(workflow.purge1);
	app.route('/workflow/purge2').post(workflow.purge2);

	app.route('/userdash').get(userdash.index);
	app.route('/userdash/listall').post(userdash.listall);
	app.route('/userdash/list').post(userdash.list);
	app.route('/userdash/listcombo').post(userdash.listcombo);
	app.route('/userdash/one').post(userdash.one);
	app.route('/userdash/save').post(userdash.save);
	app.route('/userdash/purge').post(userdash.purge);

	app.route('/company').get(company.index);
	app.route('/company/listall').post(company.listall);
	app.route('/company/list').post(company.list);
	app.route('/company/listcombo').post(company.listcombo);
	app.route('/company/one').post(company.one);
	app.route('/company/save').post(company.save);
	app.route('/company/purge').post(company.purge);

	app.route('/translog').get(translog.index);
	app.route('/translog/listall').post(translog.listall);
	app.route('/translog/list').post(translog.list);
	app.route('/translog/purge').post(translog.purge);

	app.route('/usertodo').get(usertodo.index);
	app.route('/usertodo/list').post(usertodo.list);
	app.route('/usertodo/purge').post(usertodo.purge);

	app.route('/productstock').get(productstock.index);
	app.route('/productstock/list').post(productstock.list);
	app.route('/productstock/listall').post(productstock.listall);

	app.route('/deliveryschedule').get(deliveryschedule.index);
	app.route('/deliveryschedule/listall').post(deliveryschedule.listall);
	app.route('/deliveryschedule/list').post(deliveryschedule.list);
	app.route('/deliveryschedule/listcombo').post(deliveryschedule.listcombo);
	app.route('/deliveryschedule/one').post(deliveryschedule.one);
	app.route('/deliveryschedule/save').post(deliveryschedule.save);
	app.route('/deliveryschedule/purge').post(deliveryschedule.purge);

	app.route('/productionschedule').get(productionschedule.index);
	app.route('/productionschedule/listall').post(productionschedule.listall);
	app.route('/productionschedule/list').post(productionschedule.list);
	app.route('/productionschedule/listcombo').post(productionschedule.listcombo);
	app.route('/productionschedule/one').post(productionschedule.one);
	app.route('/productionschedule/save').post(productionschedule.save);
	app.route('/productionschedule/purge').post(productionschedule.purge);

	app.route('/rawschedule').get(rawschedule.index);
	app.route('/rawschedule/listall').post(rawschedule.listall);
	app.route('/rawschedule/list').post(rawschedule.list);
	app.route('/rawschedule/listcombo').post(rawschedule.listcombo);
	app.route('/rawschedule/one').post(rawschedule.one);
	app.route('/rawschedule/save').post(rawschedule.save);
	app.route('/rawschedule/purge').post(rawschedule.purge);

	app.route('/periodicsales/listall').post(periodicsales.listall);
	app.route('/comparesogi/listall').post(comparesogi.listall);

};