exports.action = function(req, res, data) {
	data.tableName = 'Claim';
	data.arrayNameList = '|Images|';	
	data.arrayRejectList = '|Timestamp|'; // ชื่อ Entity ที่ไม่ต้องการให้ส่งข้อมูล;
	data.arrayEntityList = '|ClaimDate|Product|Barcode|BarcodeClaim|Action|Description|Firstname|Lastname|Nickname|Address|Address2|Province|District|Sub_District|Tel|Email|Status|Images|CustomerTrackNo|TrackNo|CreateBy|CreateDate|UpdateBy|UpdateDate|'; // ชื่อ Entity ทั้งหมดที่เพิ่มค่าได้

	try{
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}		
		else if (data.action == 'add'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' && 
				typeof req.body.type != 'undefined' && req.body.type != '' &&
				typeof req.body.barcode != 'undefined' && req.body.barcode != '' &&
				typeof req.body.product != 'undefined' && req.body.product != '' &&
				typeof req.body.description != 'undefined' && req.body.description != '' &&
				typeof req.body.firstname != 'undefined' && req.body.firstname != '' &&
				typeof req.body.lastname != 'undefined' && req.body.lastname != '' &&
				typeof req.body.address != 'undefined' && req.body.address != '' &&				
				typeof req.body.province != 'undefined' && req.body.province != '' &&
				typeof req.body.district != 'undefined' && req.body.district != '' &&
				typeof req.body.sub_district != 'undefined' && req.body.sub_district != '' &&
				typeof req.body.zipcode != 'undefined' && req.body.zipcode != '' &&				
				typeof req.body.tel != 'undefined' && req.body.tel != '' &&
				typeof req.body.images != 'undefined' && req.body.images != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}
		if (data.action == 'update'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.entity != 'undefined' && req.body.entity != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}else {
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}
		data.util.responseJson(req, res, data.json);
	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};

exports.actionAfterGetShop = function(req, res, data) {
	if (data.action == 'info') {
		exports.getGeClaimInfo(req, res, data);
	}
	else if (data.action == 'add'){
		exports.addClaim(req, res, data);
	}
	else if (data.action == 'update'){
		exports.updateClaim(req, res, data);
	}
};
//## Internal Method ##//
exports.getGeClaimInfo = function(req, res, data) {
	//if (typeof req.body.withuotsh == 'undefined' || req.body.withuotsh == '') req.body.withuotsh = true;
	req.body.withuotsh = true;
	if (req.body.status === 'SH') req.body.withuotsh = false;
	var subQuery = ((req.body.withuotsh == true) ?  " and Status ne 'SH'" :'');
	
	if (typeof req.body.status != 'undefined' && req.body.status != '') {
		subQuery += ' and Status eq '+"'"+req.body.status+"'";
	}
	
	if (typeof req.body.claimdate_from != 'undefined' && req.body.claimdate_from != ''){
		subQuery += ' and ClaimDate ge '+"datetime'"+req.body.claimdate_from+"T00:00:00Z'";
	}
	
	if (typeof req.body.claimdate_to != 'undefined' && req.body.claimdate_to != ''){
		subQuery += ' and ClaimDate le '+"datetime'"+req.body.claimdate_to+"T00:00:00Z'";
	}
	
	if (typeof req.body.id != 'undefined' && req.body.id != ''){
		var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.shop).and('RowKey eq ?'+subQuery, req.body.id);
	}else{
		var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.shop).and('RowKey ne ?'+subQuery, 'MaxID');
	}
	
	data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.ClaimNo = obj.RowKey;
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

exports.addClaim = function(req, res, data) {
	try{
		data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
			if(!error){
				data.table.retrieveEntity(data.tableName, data.shop, 'MaxID', function(error, result, response){
					if(!error) { // มีค่า MaxID แล้ว
						data.maxID = result.No._ +1;
						if (req.body.type == 'web') {
								exports.addClaimWeb(req, res, data);
						}else {
								data.json.return = true;
								data.json.error = 'MBR0004';
								data.json.errorMessage = 'Type ' + req.body.type + ' รอไปก่อนนะ ยังไม่เสร็จ';
								data.util.responseJson(req, res, data.json);
						}
					}
					else { // ไม่มีค่า MaxID
						//## - - - - BEGIN ถ้าไม่เคยมีการกำหนดค่า MaxID  - - - - ##//
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, No: {'_': 0} };
						var batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else 
							exports.actionAfterGetShop(req, res, data); // เรียก Function นี้ซ้ำ
						});
						//## - - - - END ถ้าไม่เคยมีการกำหนดค่า MaxID - - - - ##//
					}
				});
				
			}else { // End Create Table
				data.util.responseError(req, res, error);			
			}
		});
		
	}catch(error) {
		data.util.responseError(req, res, error);
	}
};
exports.addClaimWeb = function(req, res, data) {
	try{
		var d = new Date();
		var m = (d.getMonth()+1).toString();
		data.claimID = d.getFullYear().toString().substr(2)+(m[1]? m : '0'+m)+'WC'+data.util.paddingNumber(parseInt(data.maxID), 4);
		var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.claimID} };
		task.ClaimDate = {'_': new Date((new Date()).setHours(0, 0, 0, 0))};
		task.Barcode = {'_': req.body.barcode};
		task.BarcodeClaim = {'_': ''};
		task.Action = {'_': ''};
		task.Product = {'_': req.body.product};		
		task.Description = {'_': req.body.description};
		task.Firstname = {'_': req.body.firstname};
		task.Lastname = {'_': req.body.lastname};
		task.Nickname = {'_': req.body.nickname};
		task.Address = {'_': req.body.address};
		task.Address2 = {'_': req.body.address2};
		task.Province = {'_': req.body.province};
		task.District = {'_': req.body.district};
		task.Sub_District = {'_': req.body.sub_district};
		task.Zipcode = {'_': req.body.zipcode};
		task.Tel = {'_': req.body.tel};
		task.Email = {'_': req.body.email};
		task.Status = {'_': 'CI'};
		task.Images = {'_': req.body.images};
		task.CustomerTrackNo = {'_': ''};
		task.TrackNo = {'_': ''};
		task.CreateBy = {'_': req.body.firstname};
		task.CreateDate = {'_': new Date()};
		task.UpdateBy = {'_': 'web'};
		task.UpdateDate = {'_': new Date()};
		var batch = new data.azure.TableBatch();
		batch.insertEntity(task, {echoContent: true});
		data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
			var values = {}
			values.Status = result[0].entity.Status._;
			values.ClaimNo = result[0].entity.RowKey._;
			//## - - - - BEGIN เพิ่มค่า MaxID - - - - ##//
			var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, No: {'_': data.maxID} };
			var batch = new data.azure.TableBatch();
			batch.updateEntity(task, {echoContent: true});
			data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else{
				data.json.return = true;
				data.json.success = true;
				data.json.result = values;
				data.util.responseJson(req, res, data.json);
			}});
			//## - - - - END เพิ่มค่า MaxID - - - - ##//

						
		}});
	}catch(error) {
		data.util.responseError(req, res, error);
	}
};
exports.updateClaim = function(req, res, data) {
	try{
		data.table.retrieveEntity(data.tableName, data.shop, req.body.id , function(error, result, response){
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
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': req.body.id} };
						task.UpdateDate = {'_': new Date()};
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
				data.json.errorMessage = 'Claim No. ' + req.body.id + ' not found';
				data.util.responseJson(req, res, data.json);
			}			
		});
	}catch(error) {
		data.util.responseError(req, res, error);
	}

};