exports.action = function(req, res, data) {

	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.type != 'undefined' && req.body.type != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				var type = '|categoryName|'; // ชื่อ type ที่สามารถเรียกดูข้อมูลได้
				if ( type.indexOf('|'+req.body.type+'|') == -1 ) { // ถ้าชื่อ Entity ไม่ถูกต้อง
					data.json.return = true;
					data.json.error = 'PRD0001';
					data.json.errorMessage = 'Unknown type ' + req.body.type;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					data.json.returnResult = true;
					if (req.body.type == 'categoryName') 
						data.command = 'EXEC sp_ShopProductByCategoryName \''+req.body.shop+'\', \''+req.body.value+'\'';
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