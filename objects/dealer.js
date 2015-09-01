exports.action = function(req, res, data) {
	data.tableName = 'RegisterDealer';
	data.arrayNameList = '|PictureUrl|';	
	data.arrayRejectList = '|Timestamp|'; // ชื่อ Entity ที่ไม่ต้องการให้ส่งข้อมูล;
	data.arrayEntityList = '|Firstname|Lastname|Nickname|Province|Phone|TimeToContact|Address|Profile|Reason|Expect|Comment|PictureUrl|'; // ชื่อ Entity ทั้งหมดที่เพิ่มค่าได้
	
	try {
		if (data.action == 'info'){			
			data.json.return = false;
			if(typeof req.body.firstname != 'undefined' && req.body.firstname != ''){
				exports.getInfoByFirstname(req, res, data);
			}
			else if(typeof req.body.lastname != 'undefined' && req.body.lastname != ''){
				exports.getInfoByLastname(req, res, data);
			}
			else if(typeof req.body.firstname != 'undefined' && req.body.firstname != '' && typeof req.body.lastname != 'undefined' && req.body.lastname != ''){
				exports.getInfoByName(req, res, data);
			}else{
				exports.getDealerRegisterInfo(req, res, data);
			}
			
		}
		else if (data.action == 'register'){
			if (typeof req.body.value != 'undefined' && req.body.value != '') {			
					data.json.return = false;
					exports.registerDealer(req, res, data);
			}
		}
		else if (data.action == 'update'){
			if (typeof req.body.value != 'undefined' && req.body.value != '') {
					data.json.return = true
					data.json.error = 'API0001';
					data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
					/*data.json.return = false;
					exports.registerDealerUpdate(req, res, data);*/
			}
		}else {
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}

		data.util.responseJson(req, res, data.json);
		
	}catch(error){
		data.util.responseError(req, res, error);
	}
};
//## Internal Method ##//
exports.getDealerRegisterInfo = function(req, res, data) {
	var query = new data.azure.TableQuery().where('PartitionKey ne ?', 'MAX_VALUE')
	data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.Firstname = obj.PartitionKey;
					obj.Lastname = obj.RowKey;
					delete obj.RowKey;
					delete obj.PartitionKey;
					array.push(obj);
				}
				data.json.return = true;
				data.json.success = true;
				data.json.result = array;
				data.util.responseJson(req, res, data.json);
			}
			else {				
				data.json.return = true;
				data.json.success = false;
				delete data.json.error;
				delete data.json.errorMessage;
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});

};
exports.getInfoByFirstname = function(req, res, data) {
	var query = new data.azure.TableQuery().where('PartitionKey eq ?', req.body.firstname)
	data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.Firstname = obj.PartitionKey;
					obj.Lastname = obj.RowKey;
					delete obj.RowKey;
					delete obj.PartitionKey;
					array.push(obj);
				}
				data.json.return = true;
				data.json.success = true;
				data.json.result = array;
				data.util.responseJson(req, res, data.json);
			}
			else {				
				data.json.return = true;
				data.json.success = false;
				delete data.json.error;
				delete data.json.errorMessage;
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});

};
exports.getInfoByLastname = function(req, res, data) {
	var query = new data.azure.TableQuery().where('RowKey eq ?', req.body.lastname)
	data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.Firstname = obj.PartitionKey;
					obj.Lastname = obj.RowKey;
					delete obj.RowKey;
					delete obj.PartitionKey;
					array.push(obj);
				}
				data.json.return = true;
				data.json.success = true;
				data.json.result = array;
				data.util.responseJson(req, res, data.json);
			}
			else {				
				data.json.return = true;
				data.json.success = false;
				delete data.json.error;
				delete data.json.errorMessage;
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});

};
exports.getInfoByName = function(req, res, data) {
	var query = new data.azure.TableQuery().where('PartitionKey eq ?', req.body.firstname).and('RowKey eq ?', req.body.lastname)
	data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.Firstname = obj.PartitionKey;
					obj.Lastname = obj.RowKey;
					delete obj.RowKey;
					delete obj.PartitionKey;
					array.push(obj);
				}
				data.json.return = true;
				data.json.success = true;
				data.json.result = array;
				data.util.responseJson(req, res, data.json);
			}
			else {				
				data.json.return = true;
				data.json.success = false;
				delete data.json.error;
				delete data.json.errorMessage;
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});

};
exports.registerDealer = function(req, res, data) {
	data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){ // ถ้าสร้าง Table เสร็จแล้ว
			var json = null;
			
			try {
				data.jsonPost = JSON.parse(req.body.value);
			}catch(err){ // Check ว่าข้อมูล Json ถูก
				data.json.return = true;
				data.json.success = false;
				data.json.error = 'MBR0002';
				data.json.errorMessage = 'Can\'t parse data to JSON object';
				data.util.responseJson(req, res, data.json);
			}
				var task = {};				
				var keys = Object.keys( data.jsonPost );
				var isError = false;
				for( var i = 0; i < keys.length; i++ ) {
					if ( data.arrayEntityList.indexOf( '|'+ keys[i] +'|' ) == -1 ) {
						isError = true;
						data.json.return = true;
						data.json.error = 'MBR0006';
						data.json.errorMessage = 'Unknown entity ' + keys[i];
						data.util.responseJson(req, res, data.json);
						break;
					}
					else {
						task[keys[i]] = {'_': data.jsonPost[keys[i]]};
						task.PartitionKey = {'_': data.jsonPost['Firstname']};
						task.RowKey = {'_': data.jsonPost['Lastname']};
						data.Firstname = data.jsonPost['Firstname'];
						data.Lastname =  data.jsonPost['Lastname'];
						delete task.Firstname;
						delete task.Lastname;
					}
				}
				
				
				if (!isError) {

					task.RegisterDate = {'_': new Date()};
					task.Timezone = {'_': 7};
					task.Locale = {'_': 'th_TH'};

					var batch = new data.azure.TableBatch();
					batch.insertEntity(task, {echoContent: true});
					data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
						data.json.return = true;
						data.json.success = true;
						data.util.responseJson(req, res, data.json);
					}});
				}			
		}else { // End Create Table
			data.util.responseError(req, res, error);			
		}
	});

};

exports.registerDealerUpdate = function(req, res, data) {
	data.table.retrieveEntity(data.tableName, req.body.firstname, req.body.lastname,function(error, result, response){
		if(!error){ // ถ้ามีข้อมลในระบบแล้ว

				var checker = data.util.renderEntity(req.body.entity, data.arrayEntityList);
				if (!checker.success) {
					data.json.return = true;
					data.json.error = 'PRD0004';
					data.json.errorMessage = 'Entity ' + checker.entityError + ' not found';
					data.util.responseJson(req, res, data.json);
				}
				else {
					var sp = req.body.value.split(',');
					sp = sp.filter(function(n){ return n !== ''; });
					if (sp.length != checker.entityList.length) {
						data.json.return = true;
						data.json.error = 'PRD0006';
						data.json.errorMessage = 'Entity length does not match entity value length ['+checker.entityList.length+'/'+sp.length+']';
						data.util.responseJson(req, res, data.json);							
					}
					else {
						var task = {};
						task.PartitionKey = req.body.firstname;
						task.RowKey = req.body.lastname;
						for(i=0; i<sp.length; i++){
							task[checker.entityList[i]] = {'_': typeof sp[i] == 'undefined' || sp[i] == '' ? '' : sp[i].trim()};
						}
						//## - - - - BEGIN แก้ไขข้อมูล - - - - ##//
						var batch = new data.azure.TableBatch();
						batch.mergeEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
							data.json.return = true;
							data.json.success = true;
							data.util.responseJson(req, res, data.json);
						}});
						//## - - - - END แก้ไขข้อมูล - - - - ##//
					}
				}
		}
		else { // ถ้าไม่มีข้อมลในระบ
			data.json.return = true;
			data.json.error = 'PRD0002';
			data.json.errorMessage = 'Product ID ' + req.body.value + ' not found';
			data.util.responseJson(req, res, data.json);
		}			
	});
};

