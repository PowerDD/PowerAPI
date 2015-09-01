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

	data = {};
	data.screen = 'index';
	data.systemName = config.systemName;
	data.title = config.systemName;
	data.titleDescription = '';
	data.apiKey = config.apiKey;
	data.shopIdTest = config.shopIdTest ;
        
	var url = req.headers['uri'].split('/');
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

	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");	
				
	var json = {};
	json.success = false;

	if (typeof req.body.apiKey == 'undefined' || req.body.apiKey == '') {
		json.error = 'API0001';
		json.errorMessage = 'Missing Parameter apiKey';
		res.json(json);
	}
	else {
		
		json.error = 'AAA';
		json.errorMessage = 'XXX';
		res.json(json);

/*
		var azure = require('azure-storage');
		var table = azure.createTableService();

		table.createTableIfNotExists('API', function(error, result, response){
			if(!error){
				var data = {};
				data.azure = azure;
				data.table = table;
				data.util = util;
				var api = require('./objects/api');
				api.checkType(req, res, data);
				api.checkAccessType(req, res, data);

				// ตรวจสอบ API ว่าสามารถเข้าใช้งาน API ได้หรือไม่ //
				var query = new azure.TableQuery().select(['AccessType', 'Active', 'ExpiryDate', 'Type', 'Website']).top(1).where('RowKey eq ?', req.body.apiKey);
				table.queryEntities('API',query, null, function(error, result, response) {

					if(!error) {
						if ( result.entries.length == 0 ) { // ไม่มี API นี้ในระบบ
							json.error = 'API0002';
							json.errorMessage = 'API Key ' + req.body.apiKey + ' not found';
							res.json(json);
						}
						else { // มี API นี้ในระบบ

							if (!result.entries[0].Active._) { // ถ้า API ไม่ Active
								json.error = 'API0003';
								json.errorMessage = 'API Key ' + req.body.apiKey + ' is not active';
								res.json(json);
							}
							else { // ถ้า API Active อยู่
								if ( Date.parse(new Date()) > Date.parse(result.entries[0].ExpiryDate._) ) { // ถ้าหมดอายุแล้ว
									json.error = 'API0004';
									json.errorMessage = 'API Key ' + req.body.apiKey + ' has expired';
									res.json(json);
								}
								else { // ถ้ายังไม่หมดอายุ
									if ( result.entries[0].Type._ == 'W' ) { // ถ้า API เป็นเว็บ
										if ( typeof req.headers['referer'] == 'undefined' ) { // ถ้าไม่มี Header Referer
											json.error = 'API0005';
											json.errorMessage = 'Missing HTTP referer header';
											res.json(json);
										}
										else {
											var url = req.headers['referer'].split('/');
											if ( result.entries[0].Website._ != url[2] ) { // ถ้าเว็บที่เรียกใช้ API ไม่ตรงกับข้อมูลในระบบ
												json.error = 'API0006';
												json.errorMessage = 'This operation is not allowed for origin '+url[2];
												res.json(json);
											}
											else {
												exports.callApi(req, res, data);
											}
										}
									}
									else { // ถ้า API เป็น Application
										if ( typeof req.headers['referer'] != 'undefined') { // ถ้ามี Header Referer (ถ้าเป็น App ไม่ต้องมี)
											/*json.error = 'API0007';
											json.errorMessage = 'API Type is invalid';
											res.json(json);/
											exports.callApi(req, res, data);
										}
										else {
											exports.callApi(req, res, data);
										}
									}
								}
							}
						}
					}
					else {
						json.error = 'AZE0001';
						json.errorMessage = error.message;
						json.errorStack = error.stack;
						res.json(json);
					}
				});
			}
			else {
				json.error = 'AZE0002';
				json.errorMessage = error.message;
				json.errorStack = error.stack;
				res.json(json);
			}
		});
*/
	}
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
