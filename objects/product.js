exports.action = function(req, res, data) {

	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.type != 'undefined' && req.body.type != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				var type = '|item|byCategoryName|byCategoryUrl4Web|'; // ชื่อ type ที่สามารถเรียกดูข้อมูลได้
				if ( type.indexOf('|'+req.body.type+'|') == -1 ) { // ถ้าชื่อ Entity ไม่ถูกต้อง
					data.json.return = true;
					data.json.error = 'PRD0001';
					data.json.errorMessage = 'Unknown type ' + req.body.type;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					if (req.body.type == 'byCategoryName') {
						data.json.returnResult = true;
						data.command = 'EXEC sp_ShopProductByCategoryName \''+req.body.shop+'\', \''+req.body.value+'\', NULL, ' + 
							( (typeof req.body.active != 'undefined' && req.body.active != '') ? '\''+req.body.active+'\'' : 'NULL' ) + 
							', '+( (typeof req.body.visible != 'undefined' && req.body.visible != '') ? '\''+req.body.visible+'\'' : 'NULL' );
					}
					else if (req.body.type == 'byCategoryUrl4Web') {
						data.json.returnResult = true;
						data.command = 'EXEC sp_ShopProductByCategoryUrl \''+req.body.shop+'\', \''+req.body.value+'\'';
					}
					else if (req.body.type == 'item') {
						data.command = 'EXEC sp_ShopProductItem \''+req.body.shop+'\', \''+req.body.value+'\'';
					}
					data.util.query(req, res, data); 
				}
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
					data.json.returnResult = true;
					data.command = 'EXEC sp_ShopProductUpdate \''+req.body.shop+'\', \''+req.body.id+'\', \''+req.body.entity+'\', \''+req.body.value+'\'';
					data.util.execute(req, res, data); 
			}
		}
		else if (data.action == 'delete'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.id != 'undefined' && req.body.id != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'category_brand'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'all'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'mkdir'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.command = 'EXEC sp_ShopProduct4Mkdir \''+req.body.shop+'\'';
				data.util.query(req, res, data); 
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
exports.process = function(req, res, data) {
	if (data.action == 'mkdir') {
		exports.mkdir(req, res, data);
	}
	if (data.action == 'info') {
		if (req.body.type == 'item') {
			exports.getItemImage(req, res, data);
		}
	}
	else {
		data.json.error = 'API0002';
		data.json.errorMessage = 'Unknow Action';
		data.util.responseJson(req, res, data.json);
	}
};

exports.mkdir = function(req, res, data) {
	var shell = require('shelljs');
	shell.exec('mkdir "/var/www/powerdd/src/img/product/'+data.result[0].shop+'"', {async:false});
	for(i=0; i<data.result.length; i++) {
		shell.exec('mkdir "/var/www/powerdd/src/img/product/'+data.result[i].shop+'/'+data.result[i].sku+'"', {async:true});
	}
	data.json.return = true;
	data.json.success = true;
	data.util.responseJson(req, res, data.json);
};

exports.getItemImage = function(req, res, data) {

	var fs = require('fs');
	delete data.result[0].image;

	var files = fs.readdirSync('/var/www/powerdd/src/img/product/'+data.result[0].shop+'/'+data.result[0].sku+'/');
	var type = '|jpg|jpeg|png|gif|'; // ชื่อ type รูปภาพ
	var image = [];
	var imageDetail = [];
	for (f = 0; f < files.length; f++) {
		var sp = files[f].toLowerCase().split('.');
		if ( type.indexOf('|'+sp[sp.length-1]+'|') == -1 ) {
			if ( data.util.isNumeric(parseInt(sp[0])) ) {
				image.push( files[f] );
			}
			else if ( files[f].toLowerCase().substr(0,1) == 'd' ) {
				imageDetail.push( files[f] );
			}
		}
	}
	if (image.length > 0) {
		data.result[0].image = image;
	}
	if (imageDetail.length > 0) {
		data.result[0].image = imageDetail;
		imageDetail.sort();
	}

	data.json.return = true;
	data.json.result = data.result[0];

	data.json.success = true;
	data.util.responseJson(req, res, data.json);
};