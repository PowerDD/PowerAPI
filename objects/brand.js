exports.action = function(req, res, data) {
	data.tableName = 'Brand';
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_ShopBrand \''+req.body.shop+'\'';
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
		else if (data.action == 'brandPos'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopBrandInfo \''+req.body.shop+'\'';
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