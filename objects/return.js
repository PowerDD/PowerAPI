exports.action = function(req, res, data) {
	try{
		if (data.action == 'returnInfo'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_Pos_ReturnProductInfo \''+req.body.shop+'\'';
					data.util.query(req, res, data);
			}
		}
		else if (data.action == 'returnAdd'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.returnNo != 'undefined' && req.body.returnNo != '' &&
				typeof req.body.barcode != 'undefined' && req.body.barcode != '' &&
				typeof req.body.sellNo != 'undefined' && req.body.sellNo != '' &&
				typeof req.body.product != 'undefined' && req.body.product != '' &&
				typeof req.body.returnDate != 'undefined' && req.body.returnDate != '' &&
				typeof req.body.salePrice != 'undefined' && req.body.salePrice != '') {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_Pos_ReturnProductInsert \''+req.body.shop+'\',\''+req.body.returnNo+'\',\''+req.body.barcode+'\',\''+req.body.sellNo+'\',\''+req.body.product+'\',\''+req.body.returnDate+'\',\''+req.body.returnBy+'\',\''+req.body.salePrice+'\'';
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
