exports.action = function(req, res, data) {
	data.tableName = 'Product';
	
	try {
		if (data.action == 'xxx'){

			if (data.subAction[0] == 'yyy'){
				if (typeof req.body.message != 'undefined' && req.body.message != '') {
					data.json.return = true;
					data.json.success = true;
				}
			}
			else if (data.subAction[0] == 'zzz'){
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


//## Internal Method ##//
exports.actionAfterGetShop = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
	}
	else if (data.action == 'add') { // เพิ่มข้อมูล
		data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
			if(!error){
			}
			else { // End Create Table
				data.util.responseError(req, res, error);			
			}
		});
	}
	else if (data.action == 'update') { // แก้ไขข้อมูล
	}
	else if (data.action == 'delete') { // ลบข้อมูล
	}
};


//## Utilities Method ##//
exports.xxx = function() {
};