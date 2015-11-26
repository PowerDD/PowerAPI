exports.action = function(req, res, data) {
	try {
		
		if (data.action == 'shop'){
			if (data.subAction[0] == 'info'){
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_RegisterShopInfo \''+req.body.firstname+'\', \''+req.body.lastname+'\', \''+req.body.mobile+'\'';
				data.util.query(req, res, data);
			}else if(data.subAction[0] == 'register'){
				if (typeof req.body.firstname != 'undefined' && req.body.firstname != '' &&
					typeof req.body.lastname != 'undefined' && req.body.lastname != '' &&
					typeof req.body.time != 'undefined' && req.body.time != '' &&
					typeof req.body.mobile != 'undefined' && req.body.mobile != '' &&
					typeof req.body.address != 'undefined' && req.body.address != '') {
					
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_RegisterShop \''+req.body.firstname+'\', \''+req.body.lastname+'\', \''+req.body.nickname+'\', \''+req.body.time+'\', \''+req.body.mobile+'\', \''+req.body.address+'\', \''+req.body.images+'\'';
					data.util.query(req, res, data);			
				}
			}
			data.util.responseJson(req, res, data.json); 

		}else {
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}

	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};
//## Internal Method ##//
exports.process = function(req, res, data) {
	data.json.error = 'API0002';
	data.json.errorMessage = 'Unknow Action';
	data.util.responseJson(req, res, data.json);
};