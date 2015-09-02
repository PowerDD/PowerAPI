//## - - - MS SQL - - - ##//
exports.query = function(req, res, data){
	var sql = require('mssql')
		, require('../config.js');
	var connection = new sql.Connection(config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.query(data.command, function (err, recordset, returnValue) {
			if (!err){
				data.result = recordset;
				data.object.process(req, res, data);
			}else{
				var json = {};
				json.success = false;
				json.error = 'UTL0001';
				json.errorMessage = err.message;
				res.json(json);
			}
		});
	 });
};

exports.queryMultiple = function(req, res, data){
	var sql = require('mssql')
		, require('../config.js');
	var connection = new sql.Connection(config.mssql, function (err) {
		var request = new sql.Request(connection);
		request.multiple = true;
		request.query(data.command, function (err, recordset, returnValue) {
			if (!err){
				data.result = recordset;
				data.object.process(req, res, data);
			}else{
				var json = {};
				json.success = false;
				json.error = 'UTL0002';
				json.errorMessage = err.message;
				res.json(json);
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