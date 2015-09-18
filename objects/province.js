exports.action = function(req, res, data) {

	var lang = typeof req.body.language != 'undefined' && req.body.language != '' ? req.body.language : 'Th'; // Default Th
	
	try {
		console.log(data.action)
		if (data.action == 'list'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ProvinceInfo \''+lang+'\'';
				data.util.query(req, res, data)
			}
		}
		else if (data.action == 'district'){
			if (typeof req.body.province != 'undefined' && req.body.province != '') {
				data.json.return = false;
				exports.getDistrict(req, res, data);
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


