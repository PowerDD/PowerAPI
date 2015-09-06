exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' 
				&& typeof req.body.type != 'undefined' && req.body.type != '') {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC '+((req.body.type == 'category') ? 'sp_ShopCategoryEntity' : 'sp_ShopProductPropertiesCommon')+' \''+req.body.shop+'\'';
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
	if (data.action == 'xxx') {
	}
	else {
		data.json.error = 'API0002';
		data.json.errorMessage = 'Unknow Action';
		data.util.responseJson(req, res, data.json);
	}
};