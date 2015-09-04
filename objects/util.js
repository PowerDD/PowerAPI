//## - - - MS SQL - - - ##//
exports.query = function(req, res, data){
	var sql = require('mssql');
	var connection = new sql.Connection(global.config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.query(data.command, function (err, recordset, returnValue) {
			if (!err){
				if (recordset.length > 0) {
					data.result = recordset;
					data.object.process(req, res, data);
				}
				else {
					data.json.return = true;
					data.json.error = 'UTL0001';
					data.json.errorMessage = 'Data Not found';
					exports.responseJson(req, res, data.json);
				}
			}
			else {
				data.json.error = 'UTL0002';
				data.json.errorMessage = err.message;
				exports.responseJson(req, res, data.json);
			}
		});
	 });
};

exports.queryMultiple = function(req, res, data){
	var sql = require('mssql');
	var connection = new sql.Connection(global.config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.multiple = true;
		request.query(data.command, function (err, recordset, returnValue) {
			if (!err){
				data.json.return = true;
				data.json.success = true;
				data.json.result = recordset.length ;
				exports.responseJson(req, res, data.json);

				/*if (recordset.length > 0) {
					data.result = recordset;
					data.object.process(req, res, data);
				}
				else {
					data.json.return = true;
					data.json.error = 'UTL0001';
					data.json.errorMessage = 'Data Not found';
					exports.responseJson(req, res, data.json);
				}*/
			}
			else {
				data.json.error = 'UTL0003';
				data.json.errorMessage = err.message;
				exports.responseJson(req, res, data.json);
			}
		});
	 });
};

//## - - - Common Method - - - ##//
exports.responseJson = function(req, res, json) {
	if (json.return) {
		delete json.return;
		if (json.success) {
			delete json.error;
			delete json.errorMessage;
		}
		res.json(json);
	}
};
exports.responseError = function(req, res, error) {
	var json = {};
	json.success = false;
	json.error = 'ERR0001';
	json.errorMessage = error.message;
	json.errorStack = error.stack;
	res.json(json);
};
