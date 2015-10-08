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
				typeof req.body.totalPrice != 'undefined' && req.body.totalPrice != '' &&
				typeof req.body.saledate != 'undefined' && req.body.saledate != '') {
					data.json.return = false;
					//data.json.returnResult = true;
					data.command = 'EXEC sp_Pos_SellHeaderInsert \''+req.body.shop+'\',\''+req.body.saleno+'\',\''+req.body.profit+'\',\''+req.body.totalPrice+'\',\''+req.body.payType+'\',\''+req.body.cash+'\',\''+req.body.credit+'\',\''+req.body.customer+'\',\''+req.body.sex+'\',\''+req.body.age+'\',\''+req.body.saledate+'\',\''+req.body.saleby+'\'';
					data.util.execute(req, res, data);
			} 
		}
		else if (data.action == 'saleDetailAdd'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.saleno != 'undefined' && req.body.saleno != '' &&
				typeof req.body.product != 'undefined' && req.body.product != '' &&
				typeof req.body.price != 'undefined' && req.body.price != '' &&
				typeof req.body.cost != 'undefined' && req.body.cost != '' &&
				typeof req.body.quantity != 'undefined' && req.body.quantity != '') {
					data.json.return = false;
					//data.json.returnResult = true;
					data.command = 'EXEC sp_Pos_SellDetailInsert \''+req.body.shop+'\',\''+req.body.saleno+'\',\''+req.body.product+'\',\''+req.body.price+'\',\''+req.body.cost+'\',\''+req.body.quantity+'\',\''+req.body.comment+'\'';
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
