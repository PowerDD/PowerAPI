exports.action = function(req, res, data) {

	try {
		if (data.action == 'queue'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_WarehouseQueue \''+req.body.shop+'\'';
				data.util.query(req, res, data); 
			}
		}
		else if (data.action == 'properties') {
			if (data.subAction[0] == 'info'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
					data.json.return = false;
					data.command = 'EXEC sp_WarehouseProperties \''+req.body.shop+'\'';
					data.util.queryMultiple(req, res, data); 
				}
			}
			if (data.subAction[0] == 'update'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
					typeof req.body.type != 'undefined' && req.body.type != '' &&
					typeof req.body.name != 'undefined' && req.body.name != '') {
						data.json.return = false;
						data.json.returnResult = true;
						data.command = 'EXEC sp_WarehousePropertiesUpdate \''+req.body.shop+'\', \''+req.body.type+'\', \''+req.body.name+'\', \''+req.body.priority+'\'';
						data.util.execute(req, res, data);
				}
			}
			if (data.subAction[0] == 'delete'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
					typeof req.body.type != 'undefined' && req.body.type != '' &&
					typeof req.body.name != 'undefined' && req.body.name != '') {
						data.json.return = false;
						data.json.returnResult = true;
						data.command = 'EXEC sp_WarehousePropertiesDelete \''+req.body.shop+'\', \''+req.body.type+'\', \''+req.body.name+'\'';
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
exports.process = function(req, res, data) {
	if (data.action == 'properties'){
		if (data.subAction[0] == 'info'){
			data.json.shippingType = data.result[0];
			data.json.priority = data.result[1];
			data.json.zone = data.result[2];
			data.json.user = data.result[3];
			data.json.category = data.result[4];

			data.json.return = true;
			data.json.success = true;
			data.util.responseJson(req, res, data.json);
		}
	}
	else if (data.action == 'delete') { // ลบข้อมูล
	}
};