var Moment = require('moment');
exports.action = function(req, res, data) {
	data.tableName = 'Barcode';

	try{
		if (data.action == 'info'){
			if (typeof req.body.barcode != 'undefined' && req.body.barcode != '' ) {
					data.json.return = false;
					exports.getBarcodeDetail(req, res, data);
			}
		}
		data.util.responseJson(req, res, data.json);
	}
	catch(error) {
		data.util.responseError(req, res, error);
	}
};

//## Internal Method ##//
exports.getBarcodeDetail = function(req, res, data) {
try{
	if (data.action == 'info') { // ข้อมูลทั่วไป
		var query = new data.azure.TableQuery().where('RowKey eq ?', req.body.barcode);
		data.table.queryEntities(data.tableName, query, null, function(error, result, response) {
			if(!error){
				data.json.return = true;
				if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
					data.json.success = true;
					data.json.result = [];
					data.ProductID = '';
					data.ShopID = '';
					data.CustomerID = '';
				}
				else {
					//## - - - - BEGIN แปลงข้อมูล - - - - ##//
					var array = [];					
					for ( i=0; i<result.entries.length; i++){
						var info = {};						
						info['ID'] = result.entries[i].Product._;
						info['Shop'] = result.entries[i].PartitionKey._;
						info['Barcode'] = result.entries[i].RowKey._;
						info['SellDate'] = result.entries[i].SellDate._;
						info['Customer'] = result.entries[i].Customer._;
						array.push(info);
					}
					//## - - - - END แปลงข้อมูล - - - - ##//
					
					// เรียงลำดับข้อมูล
					array.sort( data.util.orderJsonInt('SellDate') );
					
					//## Datediff ##//
					var toDate = new Date();
					var fromDate = new Date(array[0].SellDate);
					var diff = toDate - fromDate;
					var datediff = diff/(1000 * 60 * 60 * 24);
					
					data.ProductID = array[0].ID;
					data.Barcode = array[0].Barcode;
					data.SellDate = array[0].SellDate;
					data.ShopID = array[0].Shop;
					data.CustomerID = array[0].Customer;
					data.DateDiff = datediff;
					
					/*data.len = result.entries.length;
					data.ret = array;
					data.json.success = true;
					data.json.result = array;*/
					data.ret = array;
					
				}
				//data.util.responseJson(req, res, data.json);
				exports.getShopName(req, res, data);
			}
			else {
				data.util.responseError(req, res, error);
			}
		});
	}
}catch(error) {
		data.util.responseError(req, res, error);
	}
};

exports.getShopName = function(req, res, data) {
try{
	var query = new data.azure.TableQuery().where('RowKey eq ?', data.ShopID);
	data.table.queryEntities('Shop', query, null, function(error, result, response){
		if (!error) { 
				data.json.return = true;
				if ( result.entries.length == 0 ) {
					data.json.success = true;
					data.ShopName = '';
				}
				else {
					data.ShopName = result.entries[0].Name._;
					
				}
			exports.getCustomerName(req, res, data);
		}
		else{ 
			data.util.responseError(req, res, error);
		}
	});
}catch(error) {
		data.util.responseError(req, res, error);
	}
};

exports.getCustomerName = function(req, res, data) {
try{
	var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.ShopID).and('RowKey eq ?', data.util.paddingNumber(parseInt(data.CustomerID), 6));
	data.table.queryEntities('Customer', query, null, function(error, result, response){
		if (!error) { 
				data.json.return = true;
				if ( result.entries.length == 0 ) {
					data.json.success = true;
					data.CustomerName = '';
				}
				else {
					
					if(result.entries[0].ShopName._ == '' || result.entries[0].ShopName._ == undefined){
						data.CustomerName = result.entries[0].Name._;
					}else{
						data.CustomerName = result.entries[0].ShopName._;
					}
				}
			exports.getProductInfo(req, res, data);
		}
		else{ 
			data.util.responseError(req, res, error);
		}
	});
}catch(error) {
		data.util.responseError(req, res, error);
	}
};

exports.getProductInfo = function(req, res, data) {
try{
	var query = new data.azure.TableQuery().where('RowKey eq ?', data.util.paddingNumber(parseInt(data.ProductID), 8));
	data.table.queryEntities('Product', query, null, function(error, result, response){
		if (!error) { 
				data.json.return = true;
				if ( result.entries.length == 0 ) {
					data.json.success = true;
					data.json.result = [];
				}
				else {
					var warranty = result.entries[0].Warranty._;
					var diff = warranty - data.DateDiff;
					var expDate = Moment().add(Math.round(diff), 'day');	
										
					data.json.success = true;
					data.json.Len = data.len;
					
					var values = {};
					values.ProductID = data.ProductID;
					values.SKU = result.entries[0].SKU._;
					values.ProductName = result.entries[0].Name._;
					values.Barcode = data.Barcode;
					values.SellDate = data.SellDate;
					values.Warranty = result.entries[0].Warranty._;
					values.DaysRemaining = Math.round(diff);
					values.ExpireDate = expDate;
					values.ShopID = data.ShopID;
					values.ShopName = data.ShopName;
					values.CustomerID = data.CustomerID;
					values.CustomerName = data.CustomerName;
					
					data.json.result = values;
					data.json.SellDetail = data.ret;
				}
			data.util.responseJson(req, res, data.json);
		}
		else{ 
			data.util.responseError(req, res, error);
		}
	});
}catch(error) {
		data.util.responseError(req, res, error);
	}
};