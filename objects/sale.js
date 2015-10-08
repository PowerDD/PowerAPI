exports.action = function(req, res, data) {
	try{
		if (data.action == 'saleInfo'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_ClaimInfo \''+req.body.shop+'\', \''+req.body.id+'\', \''+req.body.barcode+'\', \''+req.body.claimdate_from+'\', \''+req.body.claimdate_to+'\', \''+req.body.status+'\'';
					data.util.query(req, res, data);
			}
		}
		else if (data.action == 'saleAdd'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.saleno != 'undefined' && req.body.saleno != '' &&
				typeof req.body.profit != 'undefined' && req.body.profit != '' &&
				typeof req.body.totalPrice != 'undefined' && req.body.totalPrice != '' &&
				typeof req.body.payType != 'undefined' && req.body.payType != '' &&
				typeof req.body.cash != 'undefined' && req.body.cash != '' &&
				typeof req.body.credit != 'undefined' && req.body.credit != '' &&
				typeof req.body.customer != 'undefined' && req.body.customer != '' &&
				typeof req.body.sex != 'undefined' && req.body.sex != '' &&
				typeof req.body.age != 'undefined' && req.body.age != '' &&
				typeof req.body.saledate != 'undefined' && req.body.saledate != '' &&
				typeof req.body.saleby  != 'undefined' && req.body.saleby != '' ) {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_Pos_SellHeaderInsert \''+req.body.shop+'\',\''+req.body.saleno+'\',\''+req.body.profit+'\',\''+req.body.totalPrice+'\',\''+req.body.payType+'\',\''+req.body.cash+'\',\''+req.body.credit+'\',\''+req.body.customer+'\',\''+req.body.sex+'\',\''+req.body.age+'\',\''+req.body.saledate+'\',\''+req.body.saleby+'\'';
					data.util.query(req, res, data);
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
