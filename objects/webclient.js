/*var util = require('../objects/util');
var azure = require('../objects/azure');*/

exports.action = function(req, res, control, action, url) {
	data = {};
	data.success = false;
	data.error = 'No Action';
	data.return = true;
	
	try {
		if (action == 'get'){
			if(url[0] == 'html'){
				if (typeof req.body.url == 'undefined' || req.body.url == '') {
						data.error = 'Please fill out all required fields';
					}
					else {
						data.return = false;
						data.result = util.request(req, res, action, req.body.url);
					}	
			}

			else if(url[0] == 'azure'){
				if (typeof req.body.table == 'undefined' || req.body.table == '' || req.body.partitionkey == 'undefined' || req.body.partitionkey == '' || req.body.rowkey == 'undefined' || req.body.rowkey == '') {
						data.error = 'Please fill out all required fields';
					}
					else {
						data.return = false;
						data.result = azure.queryBarcode(req, res, action, req.body.table, req.body.partitionkey, req.body.rowkey)
					}	
			}
			
			else if(url[0] == 'product'){
				if (typeof req.body.shopid == 'undefined' || req.body.shopid == '' || req.body.barcode == 'undefined' || req.body.barcode == '') {
						data.error = 'Please fill out all required fields';
					}
					else {
						data.return = false;
						data.result = azure.queryBarcode(req, res, action, url[0], req.body.shopid, req.body.barcode)
					}	
			}
		}
		else if(action == 'simplelog')	{
			data.json.return = false;
			data.json.returnResult = true;
			data.command = 'EXEC sp_SimpleLog \''+req.body.name+'\', \''+req.body.value+'\'';
			data.util.query(req, res, data);
		}	
		
		if (data.return) {
			delete data.return;
			if (data.success) delete data.error;
			res.json(data);
		}
	}
	catch(err) {
		data = {};
		data.success = false;
		data.error = err.message;
		data.stack = err.stack;
		res.json(data);
	}
};