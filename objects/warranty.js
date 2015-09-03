var Moment = require('moment');
exports.action = function(req, res, data) {
	try{
		if (data.action == 'info'){
			if (typeof req.body.barcode != 'undefined' && req.body.barcode != '' ) {
					data.json.return = false;
					data.command = 'EXEC sp_WarrantyInfo \''+req.body.barcode+'\'';
					data.util.queryMultiple(req, res, data); 
			}
		}
		data.util.responseJson(req, res, data.json);
	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};

//## Internal Method ##//
exports.process = function(req, res, data) {
	if (data.action == 'info') {
		exports.warrantyInfo(req, res, data);
	}
	else {
		data.json.error = 'API0002';
		data.json.errorMessage = 'Unknow Action';
		data.util.responseJson(req, res, data.json);
	}
};

exports.warrantyInfo = function(req, res, data) {
	try{
		if (data.result[0][0].exist != '0' ){ // ถ้ามีข้อมูล
			data.json.return = true;
			data.json.success = true;
			var values = {};			
			values.shop = data.result[1][0].shop;
			values.shopName = data.result[1][0].shopName;
			values.barcode = data.result[1][0].barcode;		
			values.product = data.result[1][0].product;
			values.productName = data.result[1][0].productName;
			values.sellDate = data.result[1][0].sellDate;
			values.warranty = data.result[1][0].warranty;
			values.expireDate = data.result[1][0].expireDate;
			values.customer = data.result[1][0].customer;
			values.customerName = data.result[1][0].customerName;
		
			data.json.result = values;
			//data.json.Detail = data.result[1];
			data.util.responseJson(req, res, data.json);
		}else{
			data.json.return = true;
			data.json.success = true;
			data.json.result = [];
			data.util.responseJson(req, res, data.json);
		}	
	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};