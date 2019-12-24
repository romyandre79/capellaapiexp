var express = require('express'),
	app = express(),
	port = process.env.PORT || 3000,
	helmet = require('helmet'),
	bodyParser = require('body-parser'),
	response = require('./res');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
  
var routes = require('./routes');
routes(app);

app.use(function(req, res, next) {
	response.sendmsg(1,'Your Request Doesn\'t exist',res);
});

app.listen(port);
console.log('Capella ERP Indonesia Services on port: ' + port);