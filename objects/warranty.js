var Moment = require('moment');
exports.action = function(req, res, data) {
	data.tableName = 'Barcode';

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
}

exports.warrantyInfo = function(req, res, data) {
	if (data.result[0][0].exist != '0' ){ // ถ้ามีข้อมูล
		data.json.success = true;
		data.json.result = data.result;
		data.util.responseJson(req, res, data.json);
	}else{
		data.json.success = false;
		data.util.responseJson(req, res, data.json);
	}	
}