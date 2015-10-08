exports.action = function(req, res, data) {
	
	try {
		if (data.action == 'customerInfo'){			
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopCustomerInfo \''+req.body.shop+'\'';
				data.util.query(req, res, data)
			}			
		}
		else if (data.action == 'Add'){			
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' ) {
				data.json.return = false;
				data.json.returnResult = true;
				data.command = 'EXEC sp_Pos_ShopCustomerInfo \''+req.body.shop+'\'';
				data.util.query(req, res, data)
			}			
		}
		else {
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}

		data.util.responseJson(req, res, data.json);
		
	}catch(error){
		data.util.responseError(req, res, error);
	}

};
