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
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}

		data.util.responseJson(req, res, data.json);

	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};

//## Internal Method ##//
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