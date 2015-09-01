/* ยัง catch function request  ไม่ได้ */
var sql = require('mssql');
var config = require('../config.js');


exports.query = function(req, res, action, command){
	var connection = new sql.Connection(config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.query(command, function (err, recordset, returnValue) {
			if (!err){
				exports.responseData(req, res, action, recordset);
			}else{
				data = {};
				data.success = false; 
				data.error = err.message;
				data.stack = err.stack;
				res.json(data);
			}
		});
	 });
};

exports.queryData = function(req, res, action, command){
	var connection = new sql.Connection(config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.query(command, function (err, recordset, returnValue) {
			if (!err){
				exports.responseData(req, res, action, recordset);
			}else{
				data = {};
				data.success = false; 
				data.error = err.message;
				data.stack = err.stack;
				res.json(data);
			}
		});
	 });
};

exports.multipleQuery = function(req, res, action, command){
	var connection = new sql.Connection(config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.multiple = true;
		request.query(command, function (err, recordset, returnValue) {
			if (!err){
				responseData(req, res, action, recordset);
			}else{
				data = {};
				data.success = false; 
				data.error = err.message;
				data.stack = err.stack;
				res.json(data);
			}
		});
	 });
};

exports.responseData = function(req, res, action, recordset) {

	data = {};
	data.success = false;
	data.error = 'No Action';
	data.return = true;

	if (action == 'data') {
		data.success = typeof recordset[0] != 'undefined';
		if (data.success) {
			data.result = recordset;
		}
		else {
			data.error = 'No Data';
		}
	}
	
	else if (action == 'status') {
		if (recordset[0].returnCode == '1'){
			data.success = true;
		}
		else {
			data.error = recordset[0].returnCode;
		}
	}
	

	if (data.return) {
		delete data.return;
		if (data.success) delete data.error;
		res.json(data);
	}

};

exports.request = function(req, res, action, url) {
	var request = require('request');
	try{	
		request('http://'+url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				exports.responseHTML(req, res, action, body);
		  }/*else{
				data = {};
				data.success = false; 
				data.error = err.message;
				data.stack = err.stack;
				res.json(data);
		  }	  */
		});
	}
	catch(err) {
		data = {};
		data.success = false;
		data.error = err.message;
		data.stack = err.stack;
		res.json(data);
	}

};

exports.responseHTML = function(req, res, action, body) {
	data = {};
	data.success = false;
	data.error = 'No Action';
	data.return = true;
		if (action == 'get') {
			data.success = true;
			if (data.success) {
				data.result = body;
			}
			else {
				data.error = 'No Data';
			}
		}
		
		if (data.return) {
			delete data.return;
			if (data.success) delete data.error;
			res.json(data);
		}
};

//## Utilities Method ##//
exports.generateId = function() {	
	var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	for(var i=0; i<36; i++) {
		if (i == 8 || i == 13 || i == 18 || i == 23) text += '-';
		else 
			text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

exports.paddingNumber = function(number, length) {	
	var text = ''+number;
	while (text.length < length) text = '0' + text;
	return text;
};


exports.orderJsonString = function(prop) {
   return function(a,b){
	  if( a[prop] > b[prop]){
		  return 1;
	  }else if( a[prop] < b[prop] ){
		  return -1;
	  }
	  return 0;
   }
};

exports.orderJsonInt = function(prop) {
   return function(a,b){
	  if( parseInt(a[prop]) > parseInt(b[prop])){
		  return 1;
	  }else if( parseInt(a[prop]) < parseInt(b[prop]) ){
		  return -1;
	  }
	  return 0;
   }
};

//## Common Method ##//

exports.responseJson = function(req, res, json) {	
	if (json.return) {
		delete json.return;
		if (json.success) {
			delete json.error;
			delete json.errorMessage;
		}
		res.json(json);
	}
};

exports.responseError = function(req, res, error) {
	var json = {};
	json.success = false;
	json.error = 'ERR0001';
	json.errorMessage = error.message;
	json.errorStack = error.stack;
	res.json(json);
};


exports.convertDataToArray = function(sign, data) {
	if (data == null) {
		var arr = [];
		return arr;
	}
	else if ( data.indexOf(sign) != -1) {
		var sp = data.split(sign);
		for(i=0; i<sp.length; i++) sp[i] = sp[i].trim();
		return sp;
	}
	else {
		var arr = [data];
		return arr;
	}
};

exports.renderData = function(entity, data) {
	var info = {};
	var keys = Object.keys( entity );
	keys.sort();
	for( var i = 0; i < keys.length; i++ ) {
		if (data.arrayRejectList.indexOf('|'+keys[i]+'|') == -1)
			info[keys[i]] = (data.arrayNameList.indexOf('|'+keys[i]+'|') == -1) ? entity[keys[i]]._ : exports.convertDataToArray('|', entity[keys[i]]._);
	}
	return info;
};

exports.renderAllData = function(data) {
	var info = {};
	var keys = Object.keys( data );
	for( var i = 0; i < keys.length; i++ ) {
		info[keys[i]] = data[keys[i]]._;
	}
	return info;
};

exports.renderEntity = function(request, list) {
	var sp = request.split(',');
	sp = sp.filter(function(n){ return n !== ''; });
	var data = {};
	data.success = true;
	data.entityError = null;
	data.entityList = [];
	for (i=0; i<sp.length; i++) {
		if ( list.indexOf('|'+sp[i].trim()+'|') == -1 ) {
			data.success = false;
			data.entityError = sp[i].trim();
			delete data.entityList;
			break;
		}
		else {
			data.entityList.push(sp[i].trim() == 'ID' ? 'RowKey' : sp[i].trim());
		}
	}
	return data;
};

exports.encrypt = function(text, password) {
	var crypto = require('crypto');
	var cipher = crypto.createCipher(config.crypto.algorithm, password);
	return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};

exports.decrypt = function(encrypted, password) {
	var crypto = require('crypto');
	var decipher = crypto.createDecipher(config.crypto.algorithm, password);
	return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};

//## Query Data ##//
exports.getShop = function(req, res, data) {
	var query = new data.azure.TableQuery().top(1).where('PartitionKey eq ?', req.body.shop);
	data.table.queryEntities('Shop',query, null, function(error, result, response) {
		if(!error){			
			if ( result.entries.length == 0 ) { // ไม่มี Shop นี้ในระบบ
				data.json.return = true;
				data.json.error = 'UTL0001';
				data.json.errorMessage = 'Shop ' + req.body.shop + ' not found';
			}
			else {
				data.json.return = false;
				data.shop = result.entries[0].RowKey._;
				data.shopType = result.entries[0].Type._;
				data.object.actionAfterGetShop(req, res, data);
				exports.clearExpireCart(req, res, data);
			}
			data.util.responseJson(req, res, data.json);
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.getMemberId = function(req, res, data) {
	data.table.retrieveEntity('Login', data.shop, req.body.memberKey, function(error, result, response){
		if (!error) { // มีข้อมูล
			data.memberId = result.Member._;
			data.object.actionAfterGetMemberId(req, res, data);
		}
		else { // ไม่มีข้อมูล
			data.json.return = true;
			data.json.error = 'UTL0002';
			data.json.errorMessage = 'Member Key ' + req.body.memberKey + ' not found';
			exports.responseJson(req, res, data.json);
		}
	});
};

exports.getMemberInfo = function(req, res, data) {
	data.table.retrieveEntity('Member', data.shop, data.memberId, function(error, result, response){
		if (!error) { // มีข้อมูล
			data.memberInfo = exports.renderAllData(result);
			delete data.memberInfo.PartitionKey;
			delete data.memberInfo.Timestamp;
			if ( typeof data.memberInfo.Facebook != 'undefined' ) {
				data.memberInfo.Image = 'http://graph.facebook.com/'+data.memberInfo.Facebook+'/picture?type=large'
			}
			data.object.actionAfterGetMemberInfo(req, res, data);
		}
		else { // ไม่มีข้อมูล
			data.json.return = true;
			data.json.error = 'UTL0003';
			data.json.errorMessage = 'Member id ' + data.memberId + ' not found';
			exports.responseJson(req, res, data.json);
		}
	});
};

exports.getProductInfo = function(req, res, data) {
	data.table.retrieveEntity('Product', data.shop, exports.paddingNumber(parseInt(req.body.product), 8), function(error, result, response){
		if (!error) { // มีข้อมูล
			data.productInfo = {};
			data.productInfo.ID = result.RowKey._;
			data.productInfo.Name = result.Name._;
			data.productInfo.Stock = result.Stock._-result.OnOrder._-result.OnOrder._;
			data.productInfo.Price = result.Price._;
			data.productInfo.Price1 = result.Price1._;
			data.productInfo.Price2 = result.Price2._;
			data.productInfo.Price3 = result.Price3._;
			data.productInfo.Price4 = result.Price4._;
			data.productInfo.Price4 = result.Price4._;
			data.productInfo.Price4 = result.Price4._;
			data.productInfo.Price4 = result.Price4._;
			data.productInfo.Price5 = result.Price5._;
			data.productInfo.Active = result.Active._;
			data.productInfo.Visible = result.Visible._;
			data.productInfo.SKU = typeof result.SKU != 'undefined' ? result.SKU._ : '';
			data.productInfo.Location = typeof result.Location != 'undefined' ? result.Location._ : '';
			data.productInfo.Brand = typeof result.Brand != 'undefined' ? result.Brand._ : '00000';
			data.productInfo.Category = typeof result.Category != 'undefined' ? result.Category._ : '00000';
			data.productInfo.isPromotion = typeof result.isPromotion != 'undefined' ? result.isPromotion._ : false;
			data.productInfo.PromotionPrice = typeof result.PromotionPrice != 'undefined' ? result.PromotionPrice._ : 0;
			if ( typeof result.CoverImage != 'undefined' ) {
				var sp = result.CoverImage._.split('|');
				data.productInfo.CoverImage = sp[0];
			}
			else {
				data.productInfo.CoverImage = '';
			}
			data.object.actionAfterGetProductInfo(req, res, data);
		}
		else { // ไม่มีข้อมูล
			data.json.return = true;
			data.json.error = 'UTL0004';
			data.json.errorMessage = 'Product id '+req.body.product+' not found';
			exports.responseJson(req, res, data.json);
		}
	});
};

exports.getShopConfig = function(req, res, data) {
	data.table.retrieveEntity('Shop', data.shop, 'Config', function(error, result, response){
		data.shopConfig = (!error) ? JSON.parse(result.Name._) : {};
		data.object.actionAfterGetShopConfig(req, res, data);
	});
};

exports.getMemberAddress = function(req, res, data) {
	data.table.createTableIfNotExists('MemberAddress', function(error, result, response){ if(error) console.log(error); }); // ถ้ายังไม่มี Table นี้ ให้สร้าง

	var query = new data.azure.TableQuery().select(['RowKey', 'Firstname', 'Lastname', 'ContactName', 'Mobile', 'ShopName', 'Address', 'Address2', 'SubDistrict', 'District', 'Province', 'Zipcode']).where('PartitionKey eq ?', data.shop+'-'+data.memberId).and('Selected eq ?', true);
	data.table.queryEntities('MemberAddress',query, null, function(error, result, response) {
			console.log(result);
		if(!error && result.entries.length != 0 ) // ถ้ามีข้อมูล
			data.memberAddress = exports.renderAllData(result.entries[0]);
		else
			console.log(error);
		data.object.actionAfterGetMemberAddress(req, res, data);
	});
};

exports.updateEntityNumber = function(req, res, data, tableName, partitionKey, rowKey, entityName, value) {
	var query = new data.azure.TableQuery().select([entityName]).where('PartitionKey eq ?', partitionKey).and('RowKey eq ?', rowKey);
	data.table.queryEntities(tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล
				var task = { PartitionKey: {'_': partitionKey}, RowKey: {'_': rowKey} };
				task[entityName] = {'_': (typeof result.entries[0][entityName]._ != 'undefined') ? parseInt(result.entries[0][entityName]._)+value : value};
				var batch = new data.azure.TableBatch();
				batch.mergeEntity(task, {echoContent: true});
				data.table.executeBatch(tableName, batch, function (error, result, response) {  if(error) console.log(error); });
			}
		}
	});
};

exports.clearExpireCart = function(req, res, data) {
	var query = new data.azure.TableQuery().select(['RowKey', 'Detail']).where('PartitionKey eq ?', data.shop).and('ExpiryDate lt ?', new Date());
	data.table.queryEntities('Cart',query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล
				for (i=0; i<result.entries.length; i++) {
					// เอาของที่อยู่ในรถเข็น ไปคืนที่ Stock
					var detail = JSON.parse(result.entries[i].Detail._);
					var id = Object.keys( detail );
					for(j=0; j<id.length; j++){
						exports.updateEntityNumber(req, res, data, 'Product', data.shop, id[j], 'OnCart', detail[id[j]].Qty*-1);
					}

					// ลบข้อมูลออกจากระบบ
					var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': result.entries[i].RowKey._} };
					var batch = new data.azure.TableBatch();
					batch.deleteEntity(task, {echoContent: true});
					data.table.executeBatch('Cart', batch, function (error, result, response) {  if(error) console.log(error); });
				}
			}
		}
		else {
			console.log(error)
		}
	});
};
