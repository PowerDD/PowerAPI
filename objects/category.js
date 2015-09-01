exports.action = function(req, res, data) {
	data.tableName = 'Category';
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'add'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.name != 'undefined' && req.body.name != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'update'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.id != 'undefined' && req.body.id != '' &&
				typeof req.body.entity != 'undefined' && req.body.entity != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'delete'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.id != 'undefined' && req.body.id != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
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
	if (data.action == 'info') { // ข้อมูลทั่วไป
		var query = new data.azure.TableQuery().select(['RowKey', 'Name', 'Url', 'Priority', 'Active', 'ProductCount']).where('PartitionKey eq ?', data.shop).and('RowKey ne ?', 'MaxID');
		data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
			if(!error){
				data.json.return = true;
				if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
					data.json.success = true;
					data.json.result = [];
				}
				else {

					//## - - - - BEGIN แปลงข้อมูล - - - - ##//
					var array = [];				
					for ( i=0; i<result.entries.length; i++){
						var info = {};
						info['ID'] = result.entries[i].RowKey._;
						info['Name'] = result.entries[i].Name._;
						info['Url'] = result.entries[i].Url._;
						info['Priority'] = result.entries[i].Priority._;
						info['Active'] = result.entries[i].Active._;
						info['ProductCount'] = result.entries[i].ProductCount._;
						array.push(info);
					}
					//## - - - - END แปลงข้อมูล - - - - ##//
					// เรียงลำดับข้อมูล
					array.sort( data.util.orderJsonInt('Priority') );

					data.json.success = true;
					data.json.result = array;
				}
				data.util.responseJson(req, res, data.json);
			}
			else {
				data.util.responseError(req, res, error);
			}
		});
	}
	else if (data.action == 'add') { // เพิ่มข้อมูล
		data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
			if(!error){
				data.table.retrieveEntity(data.tableName, data.shop, 'MaxID', function(error, result, response){
					if(!error) { // มีค่า MaxID แล้ว
						var id = result.Name._ +1;

						//## - - - - BEGIN เพิ่มข้อมูล - - - - ##//
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.util.paddingNumber(id, 5) }, 
							Name: {'_': req.body.name}, 
							Url: {'_': req.body.name.toLowerCase().replace(/\ /g, '_').replace(/\//g, '-').replace(/_\-_/g, '-')}, 
							Priority: {'_': 999}, 
							ProductCount: {'_': 0}, 
							Active: {'_': true}
						};
						var batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) { 
							if(error)
								data.util.responseError(req, res, error);
							else
								data.json.return = true;
								data.json.success = true;
								data.json.id = data.util.paddingNumber(id, 5);
								data.util.responseJson(req, res, data.json);
						});
						//## - - - - END เพิ่มข้อมูล - - - - ##//
						
						//## - - - - BEGIN เพิ่มค่า MaxID - - - - ##//
						task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': id} };
						batch = new data.azure.TableBatch();
						batch.updateEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
						//## - - - - END เพิ่มค่า MaxID - - - - ##//

					}
					else { // ไม่มีค่า MaxID
						//## - - - - BEGIN ถ้าไม่เคยมีการกำหนดค่า MaxID  - - - - ##//
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': 0} };
						var batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else 
							exports.actionAfterGetShop(req, res, data); // เรียก Function นี้ซ้ำ
						});
						
						task = { PartitionKey: {'_': data.shop}, RowKey: {'_': '00000' }, 
							Name: {'_': 'ยังไม่จัดหมวดหมู่'}, 
							Url: {'_': 'uncategorized'}, 
							Priority: {'_': 999}, 
							ProductCount: {'_': 0}, 
							Active: {'_': true}
						};
						batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });

						//## - - - - END ถ้าไม่เคยมีการกำหนดค่า MaxID - - - - ##//
					}

				});
			}
			else { // End Create Table
				data.util.responseError(req, res, error);			
			}
		});
	}
	else if (data.action == 'update') { // แก้ไขข้อมูล
		var id = data.util.paddingNumber(parseInt( req.body.id ), 5); // รหัสข้อมูล
		data.table.retrieveEntity(data.tableName, data.shop, id, function(error, result, response){
			if(!error){ // ถ้ามีข้อมลในระบแล้ว

				var column = '|Name|Url|Priority|ProductCount|Active|'; // ชื่อ Entity ที่สามารถแก้ไขข้อมูลได้
				if ( column.indexOf('|'+req.body.entity+'|') == -1 ) { // ถ้าชื่อ Entity ไม่ถูกต้อง
					data.json.return = true;
					data.json.error = 'CAT0002';
					data.json.errorMessage = 'Unknown Entity ' + req.body.entity;
					data.util.responseJson(req, res, data.json);
				}
				else {
					// แปลงชนิดข้อมูลให้ถูกต้อง
					if (req.body.entity == 'Priority' || req.body.entity == 'ProductCount' ) // Integer
						req.body.value = isNaN(Number(req.body.value)) ? 0 : parseInt(req.body.value);
					else if (req.body.entity == 'Active') // Boolean
						req.body.value = req.body.value == '1';

					//## - - - - BEGIN แก้ไขข้อมูล - - - - ##//
					var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': id} };
					task[req.body.entity] = {'_': req.body.value};
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
			else { // ถ้าไม่มีข้อมลในระบ
				data.json.return = true;
				data.json.error = 'CAT0001';
				data.json.errorMessage = 'Category ID ' + req.body.id + ' not found';
				data.util.responseJson(req, res, data.json);
			}			
		});
	}
	else if (data.action == 'delete') { // ลบข้อมูล
		var id = data.util.paddingNumber(parseInt( req.body.id ), 5); // รหัสข้อมูล
		data.table.retrieveEntity(data.tableName, data.shop, id, function(error, result, response){			
			if(!error){
				//## - - - - BEGIN ลบข้อมูล - - - - ##//
				var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': id} };
				var batch = new data.azure.TableBatch();
				batch.deleteEntity(task, {echoContent: true});
				data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
					data.json.return = true;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);
				}});
				//## - - - - END ลบข้อมูล - - - - ##//
			}
			else { // ถ้าไม่มีข้อมลในระบ
				data.json.return = true;
				data.json.error = 'CAT0001';
				data.json.errorMessage = 'Category ID ' + req.body.id + ' not found';
				data.util.responseJson(req, res, data.json);
			}			
		});
	}
};

//## Utilities Method ##//