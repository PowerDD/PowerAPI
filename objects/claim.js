exports.action = function(req, res, data) {
	try{
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
					data.json.return = false;
					data.json.returnResult = true;
					data.command = 'EXEC sp_ClaimInfo \''+data.shop+'\', \''+req.body.id+'\', \''+req.body.claimdate_from+'\', \''+req.body.claimdate_to+'\', \''+req.body.status+'\'';
					data.util.query(req, res, data);
			}
		}
		else if (data.action == 'add'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.type != 'undefined' && req.body.type != '' &&
				typeof req.body.barcode != 'undefined' && req.body.barcode != '' &&
				typeof req.body.product != 'undefined' && req.body.product != '' &&
				typeof req.body.description != 'undefined' && req.body.description != '' &&
				typeof req.body.firstname != 'undefined' && req.body.firstname != '' &&
				typeof req.body.lastname != 'undefined' && req.body.lastname != '' &&
				typeof req.body.address != 'undefined' && req.body.address != '' &&
				typeof req.body.province != 'undefined' && req.body.province != '' &&
				typeof req.body.district != 'undefined' && req.body.district != '' &&
				typeof req.body.sub_district != 'undefined' && req.body.sub_district != '' &&
				typeof req.body.zipcode != 'undefined' && req.body.zipcode != '' &&
				typeof req.body.tel != 'undefined' && req.body.tel != '' &&
				typeof req.body.images != 'undefined' && req.body.images != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'update'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.entity != 'undefined' && req.body.entity != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}else {
			data.json.error = 'API0011';
			data.json.errorMessage = 'Action ' + data.action.toUpperCase() + ' is not implemented';
		}
		data.util.responseJson(req, res, data.json);
	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};
