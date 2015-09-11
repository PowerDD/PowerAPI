exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'add'){

			if (data.subAction[0] == 'project'){
				if (typeof req.body.name != 'undefined' && req.body.name != '' &&
					typeof req.body.accessType != 'undefined' && req.body.accessType != '' &&
					typeof req.body.type != 'undefined' && req.body.type != ''
				) {
					data.json.return = false;
					exports.addProject(req, res, data);
				}
			}
			else if (data.subAction[0] == 'dummy'){
			}
		}
		else {
			data.json.error = 'API00xxx';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}

		data.util.responseJson(req, res, data.json);

	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};




exports.process = function(req, res, data) {
	if (data.action == 'checkApiKey') {
		exports.checkApiKey(req, res, data);
	}
	else {
		data.json.error = 'API0007';
		data.json.errorMessage = 'Unknow Action';
		data.util.responseJson(req, res, data.json);
	}
}

//## Internal Method ##//

// ตรวจสอบ API ว่าสามารถเข้าใช้งาน API ได้หรือไม่ //
exports.checkApiKey = function(req, res, data) {
	if (data.result[0][0].exist != '1') { // ไม่มี API นี้ในระบบ
		data.json.error = 'API0002';
		data.json.errorMessage = 'API Key ' + req.body.apiKey + ' not found';
		data.util.responseJson(req, res, data.json);
	}
	else { // มี API นี้ในระบบ
		if (data.result[1][0].active != '1') { // ถ้า API ไม่ Active
			data.json.error = 'API0003';
			data.json.errorMessage = 'API Key ' + req.body.apiKey + ' is not active';
			data.util.responseJson(req, res, data.json);
		}
		else { // ถ้า API Active อยู่
			if (data.result[1][0].isExpired == '1') { // ถ้าหมดอายุแล้ว
				data.json.error = 'API0004';
				data.json.errorMessage = 'API Key ' + req.body.apiKey + ' has expired';
				data.util.responseJson(req, res, data.json);
			}
			else {
				if (data.result[1][0].type == 'web') { // ถ้า API เป็นเว็บ
					if ( typeof req.headers.referer == 'undefined' ) { // ถ้าไม่มี Header Referer						
						data.json.error = 'API0005';
						data.json.errorMessage = 'Missing HTTP referer header';
						data.util.responseJson(req, res, data.json);
					}
					else {
						var url = req.headers.referer.split('/');
						if ( url[2].indexOf(data.result[1][0].website) == -1  ) { // ถ้าเว็บที่เรียกใช้ API ไม่ตรงกับข้อมูลในระบบ
							data.json.error = 'API0006';
							data.json.errorMessage = 'This operation is not allowed for origin '+url[2];
							data.util.responseJson(req, res, data.json);
						}
						else {
							exports.callApi(req, res, data);
						}
					}
				}
				else { // ถ้า API เป็น Application
					/*data.json.success = true;
					data.json.result = data.result;
					data.util.responseJson(req, res, data.json);
					*/
					exports.callApi(req, res, data);
				}
			}
		}
	}
}

exports.callApi = function(req, res, data) {	
	var fs = require('fs');

	var url = req.headers.uri.split('/');
	url = url.filter(function(n){ return n !== ''; });
	if ( url.length >= 2 ) {
		var control = url[0];
		data.action = url[1];
		url[0] = null;
		url[1] = null;
		data.subAction = url.filter(function(n){ return n !== null; });

		fs.exists(__dirname+'/'+control+'.js', function (exists) {
			if (exists) {
				delete data.object;
				data.object = require('../objects/'+control);
				data.json.error = 'API0010';
				data.json.errorMessage = 'Please fill out all required fields';
				data.object.action(req, res, data);
			}
			else {
				json.error = 'API0008';
				json.errorMessage = 'API ' + data.control.toUpperCase() + ' is not implemented';
				res.json(json);
			}
		});
	}
	else { // กรอก URL มาไม่ครบ (ไม่มี Control หรือ Action)
		data.json.error = 'API0009';
		data.json.errorMessage = 'Please send API URL and Action request to server';
		data.util.responseJson(req, res, data.json);
	}
};




exports.addProject = function(req, res, data) {
	data.table.retrieveEntity('API', 'Config', 'maxProjectId', function(error, result, response){
		if(error){
			var batch = new data.azure.TableBatch();
			var insert = { PartitionKey: {'_':'Config'}, RowKey: {'_': 'maxProjectId'}, Name: {'_':'00000000'} };
			batch.insertEntity(insert, {echoContent: true});
			data.table.executeBatch('API', batch, function (error, result, response) {
				if(error) data.util.responseError(req, res, error);
				else exports.addProject(req, res, data);
			});
		}
		else {
			data.json.appId = data.util.paddingNumber(parseInt( result.Name._ )+1, 8);
			data.json.apiKey = data.util.generateId();
			
			var batch = new data.azure.TableBatch();
			var addDate = new Date();
			var expireDate = new Date();
			expireDate.setFullYear(expireDate.getFullYear() + 10);
			var insert = { PartitionKey: {'_': data.json.appId}, RowKey: {'_': data.json.apiKey}, 
				Name: {'_':req.body.name} , 
				Description: {'_':req.body.description} , 
				AccessType: {'_':req.body.accessType} , 
				Type: {'_':req.body.type} , 
				Website: {'_':req.body.web},
				Active: {'_':true}, 
				AddDate: {'_':addDate}, 
				ExpiryDate: {'_':expireDate}
			};				
			batch.insertEntity(insert, {echoContent: true});

			data.table.executeBatch('API', batch, function (error, result, response) {
				if(error) data.util.responseError(req, res, error);
				else {
					data.json.return = true;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);
				}
			});

			insert = { PartitionKey: {'_': 'Config'}, RowKey: {'_': 'maxProjectId'}, Name: {'_': data.json.appId} };
			batch = new data.azure.TableBatch();
			batch.updateEntity(insert, {echoContent: true});
			data.table.executeBatch('API', batch, function (error, result, response) { if(error) { console.log(error); } });

		}
	});
}


//## Utilities Method ##//
exports.checkType = function(req, res, data) {

	data.table.retrieveEntity('API', 'Type', 'A', function(error, result, response){
		if(error){
			var batch = new data.azure.TableBatch();

			var insert = { PartitionKey: {'_':'Type'}, RowKey: {'_': 'A'}, Name: {'_':'Android'}, Description: {'_':'โปรแกรมบน Android'} };
			batch.insertEntity(insert, {echoContent: true});

			insert = { PartitionKey: {'_':'Type'}, RowKey: {'_': 'i'}, Name: {'_':'iOS'}, Description: {'_':'โปรแกรมบน iOS'} };
			batch.insertEntity(insert, {echoContent: true});
			
			insert = { PartitionKey: {'_':'Type'}, RowKey: {'_': 'D'}, Name: {'_':'Desktop'}, Description: {'_':'โปรแกรมบน PC'} };
			batch.insertEntity(insert, {echoContent: true});
			
			insert = { PartitionKey: {'_':'Type'}, RowKey: {'_': 'W'}, Name: {'_':'Website'}, Description: {'_':'โปรแกรมบนเว็บไซต์'} };
			batch.insertEntity(insert, {echoContent: true});

			data.table.executeBatch('API', batch, function (error, result, response) {
				if(error) {
					console.log(error);
				}
			});
		}
	});

};

exports.checkAccessType = function(req, res, data) {

	data.table.retrieveEntity('API', 'AccessType', 'A', function(error, result, response){
		if(error){
			var batch = new data.azure.TableBatch();

			var insert = { PartitionKey: {'_':'AccessType'}, RowKey: {'_': 'G'}, Name: {'_':'Guest'}, Description: {'_':'ผู้ใช้ทั่วไป'} };
			batch.insertEntity(insert, {echoContent: true});

			insert = { PartitionKey: {'_':'AccessType'}, RowKey: {'_': 'M'}, Name: {'_':'Member'}, Description: {'_':'สมาชิกในระบบ'} };
			batch.insertEntity(insert, {echoContent: true});
			
			insert = { PartitionKey: {'_':'AccessType'}, RowKey: {'_': 'S'}, Name: {'_':'Shop'}, Description: {'_':'ร้านค้า'} };
			batch.insertEntity(insert, {echoContent: true});
			
			insert = { PartitionKey: {'_':'AccessType'}, RowKey: {'_': 'A'}, Name: {'_':'Administrator'}, Description: {'_':'ผู้ดูแลระบบ'} };
			batch.insertEntity(insert, {echoContent: true});

			data.table.executeBatch('API', batch, function (error, result, response) {
				if(error) {
					console.log(error);
				}
			});
		}
	});

};