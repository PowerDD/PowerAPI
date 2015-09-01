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

if ('development' == app.get('env')) {
	app.use(errorHandler());
}

app.get('*', function(req, res) {

	process.env['systemName'] = 'PowerDD API';

	data = {};
	data.screen = 'index';
	data.systemName = process.env.systemName;
	data.title = process.env.systemName;
	data.titleDescription = '';
	data.apiKey = "33"; //process.env.apiKey;
	data.shopIdTest = '09A3C5B1-EBF7-443E-B620-48D3B648294E';
        
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

				// ��Ǩ�ͺ API �������ö�����ҹ API ��������� //
				var query = new azure.TableQuery().select(['AccessType', 'Active', 'ExpiryDate', 'Type', 'Website']).top(1).where('RowKey eq ?', req.body.apiKey);
				table.queryEntities('API',query, null, function(error, result, response) {

					if(!error) {
						if ( result.entries.length == 0 ) { // ����� API �����к�
							json.error = 'API0002';
							json.errorMessage = 'API Key ' + req.body.apiKey + ' not found';
							res.json(json);
						}
						else { // �� API �����к�

							if (!result.entries[0].Active._) { // ��� API ��� Active
								json.error = 'API0003';
								json.errorMessage = 'API Key ' + req.body.apiKey + ' is not active';
								res.json(json);
							}
							else { // ��� API Active ����
								if ( Date.parse(new Date()) > Date.parse(result.entries[0].ExpiryDate._) ) { // ��������������
									json.error = 'API0004';
									json.errorMessage = 'API Key ' + req.body.apiKey + ' has expired';
									res.json(json);
								}
								else { // ����ѧ����������
									if ( result.entries[0].Type._ == 'W' ) { // ��� API �����
										if ( typeof req.headers['referer'] == 'undefined' ) { // �������� Header Referer
											json.error = 'API0005';
											json.errorMessage = 'Missing HTTP referer header';
											res.json(json);
										}
										else {
											var url = req.headers['referer'].split('/');
											if ( result.entries[0].Website._ != url[2] ) { // �����纷�����¡�� API ���ç�Ѻ��������к�
												json.error = 'API0006';
												json.errorMessage = 'This operation is not allowed for origin '+url[2];
												res.json(json);
											}
											else {
												exports.callApi(req, res, data);
											}
										}
									}
									else { // ��� API �� Application
										if ( typeof req.headers['referer'] != 'undefined') { // ����� Header Referer (����� App ����ͧ��)
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
	else { // ��͡ URL �����ú (����� Control ���� Action)
		json.error = 'API0009';
		json.errorMessage = 'Please send API URL and Action request to server';
		res.json(json);
	}
};

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
