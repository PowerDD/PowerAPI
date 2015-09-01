exports.action = function(req, res, data) {
	data.tableName = 'Shipping';
	
	try {
		if (data.action == 'waiting'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
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
	if (data.action == 'waiting') { // ข้อมูลทั่วไป
		var query = new data.azure.TableQuery().select(['RowKey', 'Firstname', 'Lastname', 'ContactName', 'ShopName', 'Mobile', 'Address', 'SubDistrict', 'District', 'Province', 'Zipcode']).where('PartitionKey eq ?', data.shop);
		data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
			if(!error){
				data.json.return = true;
				if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
					data.json.success = true;
					data.json.result = [];
				}
				else {

					//## - - - - BEGIN แปลงข้อมูล - - - - ##//
					var array = [];				
					for ( i=0; i<result.entries.length; i++){
						var info = {};
						info['OrderNo'] = result.entries[i].RowKey._;
						info['Firstname'] = result.entries[i].Firstname._;
						info['Lastname'] = result.entries[i].Lastname._;
						info['ContactName'] = result.entries[i].ContactName._;
						info['ShopName'] = result.entries[i].ShopName._;
						info['Mobile'] = result.entries[i].Mobile._;
						info['Address'] = result.entries[i].Address._;
						info['SubDistrict'] = result.entries[i].SubDistrict._;
						info['District'] = result.entries[i].District._;
						info['Province'] = result.entries[i].Province._;
						info['Zipcode'] = result.entries[i].Zipcode._;
						array.push(info);
					}
					//## - - - - END แปลงข้อมูล - - - - ##//
					// เรียงลำดับข้อมูล
					//array.sort( data.util.orderJsonInt('RowKey') );

					data.json.success = true;
					data.json.result = array;
				}
				data.util.responseJson(req, res, data.json);
			}
			else {
				data.util.responseError(req, res, error);
			}
		});
	}
};