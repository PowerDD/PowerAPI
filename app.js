var http = require('http')
	, express = require('express')
	, routes = require('./routes')
	, fs = require('fs')
	, path = require('path')
	, util = require('./objects/util')
	, favicon = require('serve-favicon')
	, logger = require('morgan')
	, methodOverride = require('method-override')
	, session = require('express-session')
	, bodyParser = require('body-parser')
	, errorHandler = require('errorhandler');
	//var multer = require('multer');

var app = express();

// all environments
app.set('port', process.env.PORT || 9999);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'PowerDD' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}


app.get('*', function(req, res) {

	res.send('Hello World!');
});

app.post('*', function(req, res) {

	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");	
				res.send('Hello World!');

	/*if (typeof req.body.apiKey == 'undefined' || req.body.apiKey == '') {
		json.error = 'API0001';
		json.errorMessage = 'Missing Parameter apiKey';
		res.json(json);
	}
	else {
		json.error = 'API0001';
		json.errorMessage = 'Missing Parameter apiKey';
		res.json(json);
	}*/
});

exports.callApi = function(req, res, data) {
	var json = {};
	json.success = false;

	var url = req.headers['x-original-url'].split('/');
	url = url.filter(function(n){ return n !== ''; });
	if ( url.length >= 2 ) {
		var control = url[0];
		data.action = url[1];
		url[0] = null;
		url[1] = null;
		data.subAction = url.filter(function(n){ return n !== null; });
		fs.exists('./objects/'+control+'.js', function (exists) {
			if (exists) {
				var object = require('./objects/'+control);

				data.json = {};
				data.json.success = false;
				data.json.return = true;
				data.json.error = 'API0010';
				data.json.errorMessage = 'Please fill out all required fields';
				data.object = object;

				object.action(req, res, data);
			}
			else {
				json.error = 'API0008';
				json.errorMessage = 'API ' + data.control.toUpperCase() + ' is not implemented';
				res.json(json);
			}
		});
	}
	else { // กรอก URL มาไม่ครบ (ไม่มี Control หรือ Action)
		json.error = 'API0009';
		json.errorMessage = 'Please send API URL and Action request to server';
		res.json(json);
	}
};

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
