exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'account'){
			if (data.subAction[0] == 'info'){
				if (typeof req.body.key != 'undefined' && req.body.key != '' ) {
					data.json.return = false;
					data.json.returnResult = true;
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
					data.command = 'EXEC sp_WalletAccountInfo \''+req.body.apiKey+'\', \''+ip+'\', \''+req.body.key+'\'';
					data.util.query(req, res, data)
				}
			}
		}
		if (data.action == 'transaction'){
			if (data.subAction[0] == 'update'){
				if (typeof req.body.key != 'undefined' && req.body.key != ''
					 && typeof req.body.transactionDate != 'undefined' && req.body.transactionDate != ''
					 && typeof req.body.transactionType != 'undefined' && req.body.transactionType != ''
					 && typeof req.body.channel != 'undefined' && req.body.channel != ''
					 && typeof req.body.withdrawal != 'undefined' && req.body.withdrawal != ''
					 && typeof req.body.deposit != 'undefined' && req.body.deposit != ''
					) {
					data.json.return = false;
					data.json.returnResult = true;
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
					var shop = req.body.key.substr(0,8);
					var bankType = req.body.key.substr(8,2);
					var accNo = req.body.key.substr(10);
					data.command = 'EXEC sp_WalletUpdateBankTransaction \''+req.body.apiKey+'\', \''+ip+'\', \''+shop+'\', \''+bankType+'\', \''+accNo+
						'\', \''+req.body.transactionDate+'\', \''+req.body.transactionType+'\', \''+req.body.channel+'\', '+req.body.withdrawal+', '+req.body.deposit+
						', \''+req.body.accountNo+'\', \''+req.body.details+'\'';
					data.util.query(req, res, data)
				}
			}
		}

		data.util.responseJson(req, res, data.json);
		
	}catch(error){
		data.util.responseError(req, res, error);
	}

};