var azure = require('azure-storage');
var tableService = azure.createTableService();

exports.queryBarcode = function(req, res, action, tableName, PartitionKey, RowKey){
	data = {};
	data.exist = true;
	var datetime = new Date();
	try{
	var query = new azure.TableQuery()
		  .select(['Product','SellDate'])
		  .top(1)
		  .where('PartitionKey eq ?', PartitionKey)
		  .and('RowKey eq ?', RowKey);
		  
		tableService.queryEntities(tableName, query, null, function(error, result, response) {
			  if (!error) {
					var SellDate = result.entries[0].SellDate._;
					var Product = result.entries[0].Product._;
					var productName = '555';//exports.queryProduct(tableName, PartitionKey, Product);
					var datesell = new Date(SellDate);
					var diff = datetime.getTime() - datesell.getTime();
					var days = diff/(1000 * 60 * 60 * 24);
					if (SellDate != null){
						data.result = productName+' : '+Math.round(days);
						res.json(data);
					}
					else{
						data = {};
						data.exist = false
						res.json(data);						
					}
			  } 
			  else{
					data = {};
					data.success = false; 
					data.error = err.message;
					data.stack = err.stack;
					res.json(data);
			  }		  
		});
		
	}
	catch(error) {
		data = {};
		data.success = false;
		data.error = err.message;
		data.stack = err.stack;
		res.json(data);
	}	
};
/*
exports.queryProduct = function(tableName, PartitionKey, productId){
	data = {};
	data.return = true;
	var query = new azure.TableQuery()
		  .select(['SKU','Name','Warranty'])
		  .top(1)
		  .where('PartitionKey eq ?', PartitionKey)
		  .and('RowKey eq ?', productId);
		  
		tableService.queryEntities(tableName, query, null, function(error, result, response) {
			  if (!error) {
				  data.result = 'Hi'; //result.entries[0].Name._;
			  } else{
				  data.result = 'No Data';
			  }
		});
};	*/	
