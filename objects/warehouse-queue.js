exports.action = function(req, res, data) {

	try {
		if (data.action == 'properties'){
			if (data.subAction[0] == 'info'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
						data.json.return = false;
						data.command = 'EXEC sp_WarehouseProperties \''+req.body.shop+'\'';
						data.util.execute(req, res, data); 
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
exports.actionAfterGetShop = function(req, res, data) {
	if (data.action == 'properties'){
		if (data.subAction[0] == 'info'){
			/*data.json.shippingType = data.result[0];
			data.json.priority = data.result[1];
			data.json.category = data.result[2];
			data.json.user = data.result[3];*/

			//data.json.category = data.result[2];

			data.json.return = true;
			data.json.success = true;
			data.util.responseJson(req, res, data.json);
		}
	}
	else if (data.action == 'delete') { // ลบข้อมูล
	}
};