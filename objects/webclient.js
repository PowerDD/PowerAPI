exports.action = function(req, res, data) {
	try {
		if (data.action == 'geoip'){
			if (data.subAction[0] == 'info'){
				if (typeof req.body.ip != 'undefined' && req.body.ip) {
					data.json.return = false;
					var request = require('request');
					request.get({url: 'http://ip-api.com/json/'+req.body.ip},
					function (error, response, body) {
						data.json.return = true;
						if (!error) {
							data.json.success = true;
							data.json.result = JSON.parse(body);
							data.util.responseJson(req, res, data.json);
						}
						else {	
							data.util.responseError(req, res, error);
						}
					});
				}
			}
			else if (data.subAction[0] == 'update'){
				if (typeof req.body.data != 'undefined' && req.body.data) {
					var json = JSON.parse(req.body.data);
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_GeolocationUpdate \''+ipAddress+'\', \''+asn+'\', \''+city+'\', \''+country+'\', \''+countryCode+'\', \''+isp+'\', \''+organization+'\', \''+zipcode+'\', \''+latitude+'\', \''+longitude+'\'';
					data.util.execute(req, res, data);
				}
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