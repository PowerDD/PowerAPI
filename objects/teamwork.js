exports.action = function(req, res, data) {

	try {
		if (data.action == 'info'){
		}
		else if (data.action == 'report'){
			if (data.subAction[0] == 'headsale-monthly'){
				if (typeof req.body.month != 'undefined' && req.body.month != '' 
					&& typeof req.body.year != 'undefined' && req.body.year != '' ) {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC Sbs.Remax.dbo.sp_HeadSaleCommission \''+req.body.year+'\', \''+req.body.month+'\'';
					data.util.query(req, res, data)
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