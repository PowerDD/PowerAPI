exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'account'){
			if (data.subAction[0] == 'info'){
				if (typeof req.body.key != 'undefined' && req.body.key != '' ) {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_WalletAccountInfo \''+req.body.key+'\'';
					data.util.query(req, res, data)
				}
			}
		}

		data.util.responseJson(req, res, data.json);
		
	}catch(error){
		data.util.responseError(req, res, error);
	}

};