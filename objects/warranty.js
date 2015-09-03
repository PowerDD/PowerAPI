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
			/*values.ProductID = data.result[1][0];
			values.SKU = rdata.result[1][0];
			values.ProductName = data.result[1][0];
			values.Barcode = data.result[1][0];
			values.SellDate = data.result[1][0];
			values.Warranty = data.result[1][0];
			values.DaysRemaining = data.result[1][0];
			values.ExpireDate = data.result[1][0];
			values.ShopID = data.result[1][0];
			values.ShopName = data.result[1][0];
			values.CustomerID = data.result[1][0];
			values.CustomerName = data.result[1][0];
			
			values.shop = data.result[1][0].shop;
			values.product = data.result[1][0].product;
			values.docNo = data.result[1][0].docNo;*/ 
			
			data.json.result = data.result[1].length;
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