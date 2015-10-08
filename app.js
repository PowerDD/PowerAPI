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
global.config = require('./config.js');

var app = express();

app.set('port', config.port || 9999);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: config.crypto.password }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
	app.use(errorHandler());
}

app.get('*', function(req, res) {

	res.header('Access-Control-Allow-Origin', '*');

	data = {};
	data.screen = 'index';
	data.systemName = config.systemName;
	data.title = config.systemName;
	data.titleDescription = '';
	data.apiKey = config.apiKey;
	data.shopIdTest = config.shopIdTest ;
        
	//var url = req.headers['uri'].split('/');	
	var url = req.url.split('/');
	url = url.filter(function(n){ return n !== ''; });
	if ( url.length >= 1 ) {
		data.screen = url[0];
		if ( data.screen == 'document' ) {
			var document = require('./objects/document');
			document.generate(req, res, data);
		}
		else if ( data.screen == 'barcode' ) {
			var barcode = require('./objects/barcode');
			barcode.generate(req, res, url[1]);
		}
		else if ( data.screen == 'img' ) {
			var image = require('./objects/image');
			image.generate(req, res, url);
		}
		else if ( data.screen == 'ip' ) {
			res.writeHead(302, {'Location': 'http://ip-api.com/json/' + url[1]});
			res.end();
		}
		else {
			fs.exists('./views/'+data.screen+'.jade', function (exists) {
				if (exists) {
					data.subUrl = (url.length == 1 ) ? '' : url[1];
					routes.index(req, res, data);
				}
				else {
					routes.index(req, res, data);
				}
			});
		}
	}
	else {
		routes.index(req, res, data);
	}
});

app.post('*', function(req, res) {

	res.header('Access-Control-Allow-Origin', '*');
	//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");	
				
	var json = {};
	json.success = false;

	if (typeof req.body.apiKey == 'undefined' || req.body.apiKey == '') {
		json.error = 'API0001';
		json.errorMessage = 'Missing Parameter apiKey';
		res.json(json);
	}
	else {

		var data = {};
		data.util = util;
		data.action = 'checkApiKey';
		data.command = 'EXEC sp_ApiExist \''+req.body.apiKey+'\'';
		data.object = require('./objects/api');

		data.json = {};
		data.json.success = false;
		data.json.return = true;
		data.json.error = 'SYS0001';
		data.json.errorMessage = 'Unknow Action';

		util.queryMultiple(req, res, data);
	}
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
