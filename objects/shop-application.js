exports.action = function(req, res, data) {
	//data.tableName = 'ShopApplication';
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.apiKey != 'undefined' && req.body.apiKey != '' && 
				typeof req.body.licenseKey != 'undefined' && req.body.licenseKey != ''  && 
				typeof req.body.deviceId != 'undefined' && req.body.deviceId != ''  && 
				typeof req.body.deviceName != 'undefined' && req.body.deviceName != '' ) {
				data.json.return = false;
				exports.getApiExist(req, res, data);
			}
		}
		else if (data.action == 'infoPos'){			
			if (typeof req.body.licenseKey != 'undefined' && req.body.licenseKey != ''  && 
				typeof req.body.deviceId != 'undefined' && req.body.deviceId != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopApplication \''+req.body.licenseKey+'\', \''+req.body.deviceId+'\'';
				data.util.query(req, res, data);
			}			
		}
		else if (data.action == 'updatePos'){			
			if (typeof req.body.apiKey != 'undefined' && req.body.apiKey != ''  &&
				typeof req.body.licenseKey != 'undefined' && req.body.licenseKey != ''  &&
				typeof req.body.column != 'undefined' && req.body.column != ''  && 
				typeof req.body.value != 'undefined' && req.body.value != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopApplicationUpdate \''+req.body.shop+'\', \''+req.body.licenseKey+'\', \''+req.body.column+'\', \''+req.body.value+'\'';
				data.util.execute(req, res, data);
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
/*exports.getApiExist = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
		var query = new data.azure.TableQuery().select(['PartitionKey', 'Name', 'Type']).where('RowKey eq ?', req.body.apiKey).and('Active eq ?', true);
		data.table.queryEntities('API',query, null, function(error, result, response) {
			if(!error && result.entries.length != 0 ) { // ถ้ามีข้อมูล
				data.apiName = result.entries[0].Name._;
				data.apiType = result.entries[0].Type._;
				exports.getShopApplicationExist(req, res, data);
			}
			else {
				data.json.return = true;
				data.json.error = 'SAP0001';
				data.json.errorMessage = 'Invalid API Key ' + req.body.apiKey;
				data.util.responseJson(req, res, data.json);

				data.table.createTableIfNotExists('ApplicationRequest', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
					if(!error){
						var task = { PartitionKey: {'_': req.body.apiKey}, RowKey: {'_': req.body.deviceId }, 
							DeviceName: {'_': req.body.deviceName}, 
							RequestDate: {'_': new Date()}
						};
						var batch = new data.azure.TableBatch();
						batch.insertOrMergeEntity(task, {echoContent: false});
						data.table.executeBatch('ApplicationRequest', batch, function (error, result, response) {  });
					}
				});

			}
		});
	}
};

exports.getShopApplicationExist = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
		var query = new data.azure.TableQuery().select(['PartitionKey', 'TableName', 'TableKey', 'DevicePrefix', 'DevicePrinter', 'MemberType'])
			.where('RowKey eq ?', req.body.licenseKey).and('DeviceId eq ?', req.body.deviceId).and('Active eq ?', true);
		data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
			if(!error && result.entries.length != 0 ) { // ถ้ามีข้อมูล
				//data.shop = result.entries[0].PartitionKey._;
				data.json.shopId = result.entries[0].PartitionKey._;
				data.json.databaseName = result.entries[0].TableName._;
				data.json.databasePassword = result.entries[0].TableKey._;
				data.json.devicePrefix = result.entries[0].DevicePrefix._;
				data.json.devicePrinter = result.entries[0].DevicePrinter._;
				data.json.memberType = result.entries[0].MemberType._;
				data.json.return = true;
				data.json.success = true;
				data.util.responseJson(req, res, data.json);
				//exports.getShopKey(req, res, data);

				//## - - - - BEGIN Update Device Name - - - - ##//
				var task = { PartitionKey: {'_': data.json.shopId}, RowKey: {'_': req.body.licenseKey}, DeviceName: {'_': req.body.deviceName}, AccessDate: {'_': new Date()} };
				var batch = new data.azure.TableBatch();
				batch.mergeEntity(task, {echoContent: true});
				data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
				//## - - - - END Update Device Name - - - - ##//
			}
			else {
				data.json.return = true;
				data.json.error = 'SAP0002';
				data.json.errorMessage = 'Invalid License Key ' + req.body.licenseKey;
				data.util.responseJson(req, res, data.json);

				data.table.createTableIfNotExists('ApplicationRequest', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
					if(!error){
						var task = { PartitionKey: {'_': req.body.apiKey}, RowKey: {'_': req.body.deviceId }, 
							DeviceName: {'_': req.body.deviceName}, 
							SystemName: {'_': data.apiName},
							SystemType: {'_': data.apiType},
							RequestDate: {'_': new Date()}
						};
						var batch = new data.azure.TableBatch();
						batch.insertOrMergeEntity(task, {echoContent: false});
						data.table.executeBatch('ApplicationRequest', batch, function (error, result, response) {  });
					}
				});

			}
		});
	}
};

exports.getShopKey = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
		var query = new data.azure.TableQuery().select(['PartitionKey']).where('RowKey eq ?', data.shop);
		data.table.queryEntities('Shop',query, null, function(error, result, response) {
			if(!error && result.entries.length != 0 ) { // ถ้ามีข้อมูล
				data.json.shopId = result.entries[0].PartitionKey._;
				data.json.return = true;
				data.json.success = true;
				data.util.responseJson(req, res, data.json);
			}
			else {
				data.json.return = true;
				data.json.error = 'SAP0003';
				data.json.errorMessage = 'Shop ID not found';
				data.util.responseJson(req, res, data.json);
			}
		});
	}
};
*/

/*exports.actionAfterGetShop = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
	}
	else if (data.action == 'add') { // เพิ่มข้อมูล
		data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
			if(!error){
			}
			else { // End Create Table
				data.util.responseError(req, res, error);
			}
		});
	}
	else if (data.action == 'update') { // แก้ไขข้อมูล
	}
	else if (data.action == 'delete') { // ลบข้อมูล
	}
};*/