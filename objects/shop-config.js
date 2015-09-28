exports.action = function(req, res, data) {
	data.tableName = 'Shop';
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'cart-expiration' || data.action == 'order-expiration'|| data.action == 'newproduct-expiration'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				var type = '|H|D|'; // ชื่อ type ที่สามารถเพิ่มข้อมูลได้
				if (typeof req.body.type == 'undefined' || req.body.type == '') req.body.type = 'H';
				if ( type.indexOf('|'+req.body.type+'|') == -1 ) { // ถ้าชื่อ type ไม่ถูกต้อง
					data.json.error = 'SCF0001';
					data.json.errorMessage = 'Unknown type ' + req.body.type;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
			}
		}
		else if (data.action == 'update') {
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {

				var entity = '|CartExpire|OrderExpire|NewProductExpire|LoginRememberExpire|LoginExpire|OrderNumberLength|membertype-buy|'; // ชื่อ Entity ที่สามารถแก้ไขข้อมูลได้
				var keys = Object.keys( JSON.parse(req.body.value) );
				var error = false;
				var errorEntityName = '';
				for(i=0; i<keys.length; i++){
					if ( entity.indexOf(keys[i]) == -1 ) {
						error = true;
						errorEntityName = keys[i];
						break;
					}
				}
				if ( error ) {
					data.json.return = true;
					data.json.error = 'SCF0002';
					data.json.errorMessage = 'Unknown entity ' + errorEntityName;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
			}
		}
		else if (data.action == 'membertype-buy') {
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
		}
		else if (data.action == 'pos'){			
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopConfig \''+req.body.shop+'\'';
				data.util.query(req, res, data)
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
exports.actionAfterGetShop = function(req, res, data) {
	if (data.action == 'info'){
		exports.getInfo(req, res, data);
	}
	else if (data.action == 'cart-expiration') { // ข้อมูลรถเข็นสินค้า
		exports.setCartExpire(req, res, data);
	}
	else if (data.action == 'order-expiration') { // ข้อมูลคำสั่งซื้อ
		exports.setOrderExpire(req, res, data);
	}
	else if (data.action == 'newproduct-expiration') { // ข้อมูลสินค้าใหม่
		exports.setNewProductExpire(req, res, data);
	}
	else if (data.action == 'membertype-buy') { // ข้อมูลประเภทสมาชิกในการซื้อ
		exports.setMemberTypeToBuy(req, res, data);
	}
	else if (data.action == 'update') {
		exports.updateData(req, res, data);
	}
};

exports.getInfo = function(req, res, data) {	
	data.table.retrieveEntity(data.tableName, data.shop, 'Config', function(error, result, response){
		if (!error) data.json.config = JSON.parse(result.Name._); // มีข้อมูล
		data.json.return = true;
		data.json.success = true;
		data.util.responseJson(req, res, data.json);
	});
};

exports.setCartExpire = function(req, res, data) {
	data.table.retrieveEntity(data.tableName, data.shop, 'Config', function(error, result, response){
		var config = {};
		if (!error) config = JSON.parse(result.Name._); // มีข้อมูล
		config.CartExpire = {};
		config.CartExpire.Type = req.body.type;
		config.CartExpire.Value = parseInt(req.body.value);

		var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(config)} };
		var batch = new data.azure.TableBatch();
		batch.insertOrMergeEntity(task, {echoContent: true});
		data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });

		data.json.return = true;
		data.json.success = true;
		data.util.responseJson(req, res, data.json);
	});
};

exports.setOrderExpire = function(req, res, data) {	
	data.table.retrieveEntity(data.tableName, data.shop, 'Config', function(error, result, response){
		var config = {};
		if (!error) config = JSON.parse(result.Name._); // มีข้อมูล
		config.OrderExpire = {};
		config.OrderExpire.Type = req.body.type;
		config.OrderExpire.Value = parseInt(req.body.value);

		var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(config)} };
		var batch = new data.azure.TableBatch();
		batch.insertOrMergeEntity(task, {echoContent: true});
		data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });

		data.json.return = true;
		data.json.success = true;
		data.util.responseJson(req, res, data.json);
	});
}
exports.setNewProductExpire = function(req, res, data) {	
	data.table.retrieveEntity(data.tableName, data.shop, 'Config', function(error, result, response){
		var config = {};
		if (!error) config = JSON.parse(result.Name._); // มีข้อมูล
		config.NewProductExpire = {};
		config.NewProductExpire.Type = 'D';
		config.NewProductExpire.Value = parseInt(req.body.value);

		var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(config)} };
		var batch = new data.azure.TableBatch();
		batch.insertOrMergeEntity(task, {echoContent: true});
		data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });

		data.json.return = true;
		data.json.success = true;
		data.util.responseJson(req, res, data.json);
	});
}

exports.setMemberTypeToBuy = function(req, res, data) {	
	data.table.retrieveEntity(data.tableName, data.shop, 'Config', function(error, result, response){
		var config = {};
		if (!error) config = JSON.parse(result.Name._); // มีข้อมูล
		config.MemberTypeToBuy = {};
		config.MemberTypeToBuy.Value = req.body.value.split(",");
		
		var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(config)} };
		var batch = new data.azure.TableBatch();
		batch.insertOrMergeEntity(task, {echoContent: true});
		data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });

		data.json.return = true;
		data.json.success = true;
		data.util.responseJson(req, res, data.json);
	});
}

exports.updateData = function(req, res, data) {
	data.table.retrieveEntity(data.tableName, data.shop, 'Config', function(error, result, response){
		var currentConfig = {};
		if (!error) currentConfig = JSON.parse(result.Name._);
		
		var newConfig = JSON.parse(req.body.value);
		var keys = Object.keys(newConfig);
		for(i=0; i<keys.length; i++){
			currentConfig[keys[i]] = newConfig[keys[i]];
		}
		
		var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(currentConfig)} };
		var batch = new data.azure.TableBatch();
		batch.insertOrMergeEntity(task, {echoContent: true});
		data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });

		data.json.return = true;
		data.json.success = true;
		data.util.responseJson(req, res, data.json);
	});
};