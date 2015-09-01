exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'encrypt'){
			if (typeof req.body.message != 'undefined' && req.body.message != '') {
				data.json.success = true;
				data.json.result = exports.encrypt(req.body.message, (req.body.key == '') ? config.crypto.password : req.body.key);
			}
		}
		else if (data.action == 'decrypt'){
			if (typeof req.body.message != 'undefined' && req.body.message != '') {
				data.json.success = true;
				data.json.result = exports.decrypt(req.body.message, (req.body.key == '') ? config.crypto.password : req.body.key);
			}
		}
		else {
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}
	
		if (data.json.return) {
			delete data.json.return;
			if (data.json.success) {
				delete data.json.error;
				delete data.json.errorMessage;
			}
			res.json(data.json);
		}

	}
	catch(error) {
		data.json.success = false;
		delete data.json.return;
		data.json.error = 'ACT0001';
		data.json.errorMessage = error.message;
		data.json.errorStack = error.stack;
		res.json(data.json);
	}
};


//## Utilities Method ##//

exports.encrypt = function(text, password) {
	var crypto = require('crypto');
	var cipher = crypto.createCipher(config.crypto.algorithm, password);
	return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};

exports.decrypt = function(encrypted, password) {
	var crypto = require('crypto');
	var decipher = crypto.createDecipher(config.crypto.algorithm, password);
	return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};