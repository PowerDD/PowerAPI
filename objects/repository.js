exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'update'){
			if (typeof req.body.path != 'undefined' && req.body.path != '') {
				data.json.return = false;
				exports.update();
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
exports.update = function(req, res, data) {
	var Client = require('svn-spawn');
	var client = new Client({ cwd: '/var/www/powerdd/'+req.body.path+'/' });

	client.update(function(err, data) {
		if(!error){
			client.getInfo(function(err, data) {
				if(!error){
					data.json.info = data;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.util.responseError(req, res, error);			
				}
			});
		}
		else {
			data.util.responseError(req, res, error);			
		}
	});
};