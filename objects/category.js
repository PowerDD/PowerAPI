exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_ShopCategory \''+req.body.shop+'\'';
				data.util.query(req, res, data); 
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
		else if (data.action == 'mkdir'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.command = 'EXEC sp_ShopCategory4Mkdir \''+req.body.shop+'\'';
				data.util.query(req, res, data); 
			}
		}
		else if (data.action == 'categoryPos'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopCategoryInfo \''+req.body.shop+'\'';
				data.util.query(req, res, data)
			}
		}
		else if (data.action == 'profit'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopCategoryProfit \''+req.body.shop+'\'';
				data.util.query(req, res, data)
			}
		}
		else if (data.action == 'report'){
			if (data.subAction[0] == 'monthly'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_ReportMonthlySaleByCategory \''+req.body.shop+'\', \''+
						((typeof req.body.shop == 'undefined' || req.body.shop == '') ? '0' : req.body.month)+'\', \''+
						((typeof req.body.type == 'undefined' || req.body.type == '') ? 'all' : req.body.type)+'\'';
					data.util.query(req, res, data)
				}
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
	shell.exec('mkdir "/var/www/powerdd/src/img/category/'+data.result[0].shop+'"', {async:false});
	for(i=0; i<data.result.length; i++) {
		shell.exec('mkdir "/var/www/powerdd/src/img/category/'+data.result[i].shop+'/'+data.result[i].url+'"', {async:true});
	}
	data.json.return = true;
	data.json.success = true;
	data.util.responseJson(req, res, data.json);
};