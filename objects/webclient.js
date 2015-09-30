exports.action = function(req, res, data) {
	try {
		if (data.action == 'geoip'){
			if (typeof req.body.ip != 'undefined' && req.body.ip) {
				var geoip = require('geoip-lite');
				data.json.return = true;
				data.json.success = true;
				data.json.result = geoip.lookup(req.body.ip);
				data.util.responseJson(req, res, data.json);
			}
		}
		else if(data.action == 'simplelog'){
			if (typeof req.body.name != 'undefined' && req.body.name != '' &&
				typeof req.body.value != 'undefined' && req.body.value != ''){
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_SimpleLog \''+req.body.name+'\', \''+req.body.value+'\'';
					data.util.execute(req, res, data);
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