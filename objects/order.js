exports.action = function(req, res, data) {
	data.tableName = 'Order';
	
	try {
		if (data.action == 'info'){

			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.key != 'undefined' && req.body.key != '' &&
				typeof req.body.orderNo != 'undefined' && req.body.orderNo != '') {

				var type = '|M|A|'; // ชื่อ type ที่สามารถดูข้อมูลได้
				if (typeof req.body.type == 'undefined' || req.body.type == '') req.body.type = 'M';
				if ( type.indexOf('|'+req.body.type+'|') == -1 ) { // ถ้าชื่อ type ไม่ถูกต้อง
					data.json.error = 'ODR0001';
					data.json.errorMessage = 'Unknown type ' + req.body.type;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}

			}
		}
		else if (data.action == 'history') {
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '') {
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
	if (data.action == 'info') { // ข้อมูลทั่วไป
		if (req.body.type == 'M'){
			req.body.memberKey = req.body.key;
			data.util.getMemberId(req, res, data);
		}
		else if (req.body.type == 'A'){
			exports.getAccessOrderInfo(req, res, data);
		}
	}
	if (data.action == 'history') {
		data.util.getMemberId(req, res, data);
	}
};

exports.actionAfterGetMemberId = function(req, res, data) {
	if (data.action == 'info') {
		exports.getMemberOrderInfo(req, res, data);
	}
	else if (data.action == 'history') {
		exports.getMemberOrderHistory(req, res, data);
	}
};

exports.getMemberOrderInfo = function(req, res, data) {
	data.table.retrieveEntity(data.tableName, data.shop+'-'+data.memberId, req.body.orderNo, function(error, result, response){ // อ่านค่าข้อมูลสินค้าในรถเข็น
		var json = {};
		if (!error) { // มีข้อมูล
			var json = {};
			data.json.header = JSON.parse(result.Header._);			
			data.json.header.OrderDate = result.OrderDate._;
			data.json.header.ExpiryDate = result.ExpiryDate._;
			data.json.header.MemberID = result.Member._;
			data.json.address = JSON.parse(result.Address._);
			delete data.json.address.ID;
			data.json.detail = JSON.parse(result.Detail._);
			data.json.active = result.Active._;
			data.json.isPrint = result.isPrint._;
			data.json.isPay = result.isPay._;
			data.json.isPack = result.isPack._;
			data.json.isShip = result.isShip._;
			data.json.isExpire = result.isExpire._;
			data.json.isCancel = result.isCancel._;

			data.json.return = true;
			data.json.success = true;
			data.util.responseJson(req, res, data.json);
		}
		else { // ไม่มีข้อมูล
			data.json.return = true;
			data.json.error = 'ODR0002';
			data.json.errorMessage = 'Order Number ' + req.body.orderNo + ' not found';
			data.util.responseJson(req, res, data.json);
		}
	});
};

exports.getAccessOrderInfo = function(req, res, data) {
	var query = new data.azure.TableQuery().select(['PartitionKey', 'Member']).where('RowKey eq ?', req.body.orderNo).and('AccessKey eq ?', req.body.key);
	data.table.queryEntities('Order',query, null, function(error, result, response) {
		var hasData = false;
		for(i=0; i<result.entries.length; i++){
			if ( result.entries[i].PartitionKey._.indexOf(data.shop) != -1 ){
				data.memberId = result.entries[i].Member._
				exports.getMemberOrderInfo(req, res, data);
				hasData = true;
				break;
			}
		}
		if (!hasData) {
			data.json.return = true;
			data.json.error = 'ODR0003';
			data.json.errorMessage = 'Invalid Access Key ' + req.body.key;
			data.util.responseJson(req, res, data.json);
		}
	});
};


exports.getMemberOrderHistory = function(req, res, data) {
	var query = new data.azure.TableQuery().select(['RowKey', 'AccessKey', 'Header', 'ExpiryDate', 'OrderDate', 'isCancel', 'isExpire', 'isPack', 'isPay', 'isPrint', 'isShip'])
		.where('PartitionKey eq ?', data.shop+'-'+data.memberId);
	data.table.queryEntities('Order',query, null, function(error, result, response) {
		if (!error) {
			if ( result.entries.length != 0 ) {
				var arr = [];
				for(i=0; i<result.entries.length; i++){
					var json = JSON.parse( result.entries[i].Header._ );
					json.OrderNo = result.entries[i].RowKey._;
					json.AccessKey = result.entries[i].AccessKey._;
					json.OrderDate = result.entries[i].OrderDate._;
					json.ExpiryDate = result.entries[i].ExpiryDate._;
					json.isCancel = result.entries[i].isCancel._;
					json.isExpire = result.entries[i].isExpire._;
					json.isPack = result.entries[i].isPack._;
					json.isPay = result.entries[i].isPay._;
					json.isPrint = result.entries[i].isPrint._;
					json.isShip = result.entries[i].isShip._;
					arr.push(json);
				}
				data.json.result = arr;
				data.json.return = true;
				data.json.success = true;
				data.util.responseJson(req, res, data.json);
			}
			else {
				data.json.return = true;
				data.json.error = 'ODR0004';
				data.json.errorMessage = 'No order history';
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};