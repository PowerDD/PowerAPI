exports.action = function(req, res, data) {
	data.tableName = 'Cart';
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'update'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '' &&
				typeof req.body.product != 'undefined' && req.body.product != '' &&
				typeof req.body.quantity != 'undefined' && req.body.quantity != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'confirm'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '' &&
				typeof req.body.firstname != 'undefined' && req.body.firstname != '' &&
				typeof req.body.lastname != 'undefined' && req.body.lastname != '' &&
				typeof req.body.mobile != 'undefined' && req.body.mobile != '' &&
				typeof req.body.address != 'undefined' && req.body.address != '' &&
				typeof req.body.subDistrict != 'undefined' && req.body.subDistrict != '' &&
				typeof req.body.district != 'undefined' && req.body.district != '' &&
				typeof req.body.province != 'undefined' && req.body.province != '' &&
				typeof req.body.zipcode != 'undefined' && req.body.zipcode != '') {
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
	data.util.getShopConfig(req, res, data);
};

exports.actionAfterGetShopConfig = function(req, res, data) {
	data.util.getMemberId(req, res, data);
};

exports.actionAfterGetMemberId = function(req, res, data) {
	data.util.getMemberInfo(req, res, data);
};

exports.actionAfterGetMemberInfo = function(req, res, data) {
	if (data.action == 'info'){
		data.util.getMemberAddress(req, res, data);
	}
	else if (data.action == 'update'){
		data.util.getProductInfo(req, res, data);
	}
	else if (data.action == 'confirm'){
		data.util.getMemberAddress(req, res, data);
	}
};


exports.actionAfterGetProductInfo = function(req, res, data) {
	data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){
			if (data.action == 'update') { // แก้ไขข้อมูล	
				exports.getChannelPrice(req, res, data);
			}
		}
		else { // End Create Table
			data.util.responseError(req, res, error);
		}
	});
};

exports.actionAfterGetMemberAddress = function(req, res, data) {
	if (data.action == 'info'){
		exports.getCartInfo(req, res, data);
	}
	else if (data.action == 'confirm'){
		exports.cartConfirm(req, res, data);
	}
};
exports.getChannelPrice = function(req, res, data) {
	data.table.retrieveEntity('MemberMapping', data.memberId, data.memberInfo.SelectedMemberType, function(error, result, response){ 
		if (!error) {
			var memberPrice = result.SellPrice._;
			if(memberPrice > 0) data.memberPrice = 'Price'+memberPrice;
			else data.memberPrice = 'Price';
			exports.updateCart(req, res, data);
		}else{
			data.memberPrice = 'Price';
		}
	});
};
exports.updateCart = function(req, res, data) {
	if (data.action == 'update'){
		if ( !data.productInfo.Active ) {
			data.json.return = true;
			data.json.error = 'CRT0001';
			data.json.errorMessage = 'Product is not active for order';
			data.util.responseJson(req, res, data.json);
		}
		else if ( !data.productInfo.Visible ) {
			data.json.return = true;
			data.json.error = 'CRT0002';
			data.json.errorMessage = 'Product is not visible for order';
			data.util.responseJson(req, res, data.json);
		}
		else if ( data.productInfo.Stock == 0 ) {
			data.json.return = true;
			data.json.error = 'CRT0003';
			data.json.errorMessage = 'Product is out of stock'; 
			data.util.responseJson(req, res, data.json);
		}
		else {
			
			data.table.retrieveEntity(data.tableName, data.shop, data.memberId, function(error, result, response){ // อ่านค่าข้อมูลสินค้าในรถเข็น
				var json = {};
				if (!error) { // มีข้อมูล
					json.header = JSON.parse(result.Header._);
					json.detail = JSON.parse(result.Detail._);
					json.brand = JSON.parse(result.Brand._);
					json.category = JSON.parse(result.Category._);
				}
				else { // ไม่มีข้อมูล
					json.header = {};
					json.detail = {};
					json.brand = {};
					json.category = {};
					json.header.Item = 0;
					json.header.Price = 0;
					json.header.Qty = 0;
				}

				// เก็บค่าข้อมูลสินค้า
				if ( typeof json.detail[data.productInfo.ID] == 'undefined' ) { // ถ้ายังไม่เคยมีสินค้าชนิดนี้ในรถเข็น
					json.header.Item++;
					json.detail[data.productInfo.ID] = {};
					json.detail[data.productInfo.ID].Qty = 0;
				}
				json.detail[data.productInfo.ID].Name = data.productInfo.Name;
				json.detail[data.productInfo.ID].PriceIndex = 1;
				json.detail[data.productInfo.ID].Price = (data.productInfo.isPromotion) ? data.productInfo.PromotionPrice : data.productInfo[data.memberPrice]; // แก้ไขราคาใหม่ (เอาค่าล่าสุด)
				json.detail[data.productInfo.ID].SKU = data.productInfo.SKU;
				json.detail[data.productInfo.ID].Location = data.productInfo.Location;
				json.detail[data.productInfo.ID].Brand = data.productInfo.Brand;
				json.detail[data.productInfo.ID].Category = data.productInfo.Category;
				json.detail[data.productInfo.ID].Image = data.productInfo.CoverImage;

				// นับจำนวนสินค้าในยี่ห้อเดียวกัน
				if ( typeof json.brand[data.productInfo.Brand] == 'undefined' ) { // ถ้ายังไม่เคยมีสินค้าชนิดนี้ในรถเข็น
					json.brand[data.productInfo.Brand] = {};
					json.brand[data.productInfo.Brand].Qty = 0;
					json.brand[data.productInfo.Brand].Item = '|'+data.productInfo.ID+'|';
					json.brand[data.productInfo.Brand].Price = 0;
				}
				else if ( json.brand[data.productInfo.Brand].Item.indexOf('|'+data.productInfo.ID+'|') == -1 ) {
					json.brand[data.productInfo.Brand].Item += data.productInfo.ID+'|';
				}

				// นับจำนวนสินค้าในหมวดหมู่เดียวกัน
				if ( typeof json.category[data.productInfo.Category] == 'undefined' ) { // ถ้ายังไม่เคยมีสินค้าหมวดหมู่นี้ในรถเข็น
					json.category[data.productInfo.Category] = {};
					json.category[data.productInfo.Category].Qty = 0;
					json.category[data.productInfo.Category].Item = '|'+data.productInfo.ID+'|';
					json.category[data.productInfo.Category].Price = 0;
				}
				else if ( json.category[data.productInfo.Category].Item.indexOf('|'+data.productInfo.ID+'|') == -1 ) {
					json.category[data.productInfo.Category].Item += data.productInfo.ID+'|';
				}
				
				var qty = parseInt(req.body.quantity); // จำนวนที่ต้องการเพิ่ม หรือลด
				if ( data.productInfo.Stock >= qty ) { // ถ้ามี Stock เพียงพอให้ซื้อ
					if ( qty < 0 && json.detail[data.productInfo.ID].Qty + qty < 0) qty = json.detail[data.productInfo.ID].Qty*-1; // ถ้าเอาสินค้าออกจากตะกร้ามากกว่าสินค้าที่มีอยู่ ให้เอาออกได้เท่าจำนวนที่มีเท่านั้น
					data.json.received = qty;
					data.productInfo.Stock -= qty;
				}
				else { // ถ้าสั่งสินค้ามากกว่า Stock ที่มี
					data.json.received = data.productInfo.Stock; // สินค้าที่ได้รับ จะเท่ากับจำนวนสินค้าใน Stock เท่านั้น
					data.productInfo.Stock = 0; // สินค้าใน Stock ไม่เหลือ
				}

				data.json.hasStock = data.productInfo.Stock > 0; // มีสินค้าเหลือหรือไม่

				if ( data.json.received != 0 ) { // ถ้าจำนวนสินค้าเปลี่ยนแปลง
					data.util.updateEntityNumber(req, res, data, 'Product', data.shop, data.productInfo.ID, 'OnCart', data.json.received); // แก้ไขข้อมูลจำวนสินค้าในรถเข็นที่ Table Product

					json.header.Qty += data.json.received; // จำนวนสินค้าทั้งหมดในรถเข็น
					json.header.Price += data.json.received*json.detail[data.productInfo.ID].Price; // ราคาสินค้าทั้งหมดในรถเข็น
					json.detail[data.productInfo.ID].Qty += data.json.received; // จำนวนสินค้าที่สั่งมาในรถเข็น

					json.brand[data.productInfo.Brand].Qty += data.json.received;
					json.brand[data.productInfo.Brand].Price += data.json.received*json.detail[data.productInfo.ID].Price;

					json.category[data.productInfo.Category].Qty += data.json.received;
					json.category[data.productInfo.Category].Price += data.json.received*json.detail[data.productInfo.ID].Price;

					if ( json.detail[data.productInfo.ID].Qty == 0 ) { // ถ้าสินค้าชนิดนี้ในรถเข็นไม่มีแล้ว
						delete json.detail[data.productInfo.ID];
						json.brand[data.productInfo.Brand].Item = json.brand[data.productInfo.Brand].Item.replace('|'+data.productInfo.ID+'|', '|');
						json.category[data.productInfo.Category].Item = json.category[data.productInfo.Category].Item.replace('|'+data.productInfo.ID+'|', '|');
						json.header.Item--;
					}
					if ( json.brand[data.productInfo.Brand].Qty == 0 ) { // ถ้าสินค้าชนิดนี้ในรถเข็นไม่มีแล้ว
						delete json.brand[data.productInfo.Brand];
					}
					if ( json.category[data.productInfo.Category].Qty == 0 ) { // ถ้าสินค้าชนิดนี้ในรถเข็นไม่มีแล้ว
						delete json.category[data.productInfo.Category];
					}

					var expire = new Date();
					if (typeof data.shopConfig.CartExpire == 'undefined') {
						data.shopConfig.CartExpire = {};
						data.shopConfig.CartExpire.Type = 'D';
						data.shopConfig.CartExpire.Value = 1;
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(data.shopConfig)} }; //14082558 Last Edit by Dej || JSON.stringify(data.shopConfig.CartExpire)
						var batch = new data.azure.TableBatch();
						batch.insertOrMergeEntity(task, {echoContent: true});
						data.table.executeBatch('Shop', batch, function (error, result, response) {  if(error) console.log(error); });
					}
					if ( data.shopConfig.CartExpire.Type == 'D' ) expire.setDate(expire.getDate() + data.shopConfig.CartExpire.Value);
					else expire.setHours(expire.getHours() + data.shopConfig.CartExpire.Value);

					data.json.productID = data.productInfo.ID;
					data.json.totalQty = json.header.Qty;
					data.json.totalItem = json.header.Item;

					data.json.price = json.header.Price;
					data.json.discountPercent = (typeof data.memberInfo.Discount == 'undefined') ? 0 : data.memberInfo.Discount;
					data.json.discountPrice = (data.json.discountPercent != 0) ? Math.floor(data.json.discountPercent*data.json.price/100) : 0;
					data.json.couponDiscount = 0;
					data.json.shippingPrice = 100;
					data.json.totalPrice = data.json.price-data.json.discountPrice-data.json.couponDiscount+data.json.shippingPrice;
					data.json.cartExpiryDate = expire;
					data.json.return = true;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);
					
					json.header.DiscountPercent = data.json.discountPercent;
					json.header.DiscountPrice = data.json.discountPrice;
					json.header.CouponDiscount = data.json.couponDiscount;
					json.header.ShippingPrice = data.json.shippingPrice;
					json.header.TotalPrice = data.json.totalPrice;

					if ( data.json.totalItem == 0 || data.json.totalQty == 0 )
					{							
						//## - - - - BEGIN ลบข้อมูล - - - - ##//
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId} };
						var batch = new data.azure.TableBatch();
						batch.deleteEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });
						//## - - - - END ลบข้อมูล - - - - ##//
					}
					else {
						//## - - - - BEGIN Update ข้อมูล  - - - - ##//
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId}, Header: {'_': JSON.stringify(json.header)}, Detail: {'_': JSON.stringify(json.detail)}, Brand: {'_': JSON.stringify(json.brand)}, Category: {'_': JSON.stringify(json.category)} };
						task['UpdateDate'] = {'_': new Date()};
						task['ExpiryDate'] = {'_': expire};

						var batch = new data.azure.TableBatch();
						batch.insertOrMergeEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });
						//## - - - - END Update ข้อมูล - - - - ##//
					}

				}

				else {
					delete data.json.received;
					delete data.json.hasStock;
					data.json.return = true;
					data.json.error = 'CRT0004';
					data.json.errorMessage = 'Invalid quantity or product on cart'; 
					data.util.responseJson(req, res, data.json);
				}

			});
		}
	}
}


exports.getCartInfo = function(req, res, data) {
	if (data.action == 'info'){
			data.table.retrieveEntity(data.tableName, data.shop, data.memberId, function(error, result, response){ // อ่านค่าข้อมูลสินค้าในรถเข็น						
				if (!error) { // มีข้อมูล
					var json = {};
					if (typeof data.memberAddress != 'undefined') {
						delete data.memberAddress.RowKey;
						data.json.address = data.memberAddress;
					}
					data.json.summary = JSON.parse(result.Header._);
					data.json.detail = JSON.parse(result.Detail._);
					data.json.expiryDate = result.ExpiryDate._;
					data.json.return = true;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);
					
				}
				else { // ไม่มีข้อมูล
					data.json.return = true;
					data.json.error = 'CRT0005';
					data.json.errorMessage = 'Cart is empty';
					data.util.responseJson(req, res, data.json);
				}

			});
	}
};


exports.cartConfirm = function(req, res, data) {
	
	data.table.createTableIfNotExists('Order', function(error, result, response){ if(error) console.log(error); }); // ถ้ายังไม่มี Table นี้ ให้สร้าง

	if (data.action == 'confirm'){

		req.body.contactName = typeof req.body.contactName == 'undefined' || req.body.contactName == '' ? '' : req.body.contactName.trim();
		req.body.shopName = typeof req.body.shopName == 'undefined' || req.body.shopName == '' ? '' : req.body.shopName.trim();
		req.body.address2 = typeof req.body.address2 == 'undefined' || req.body.address2 == '' ? '' : req.body.address2.trim();
		
		var updateAddress = false;
		var addressId = '0';
		if ( typeof data.memberAddress != 'undefined' ) {
			data.memberAddress.ID = data.memberAddress.RowKey;
			addressId = data.memberAddress.ID;
			delete data.memberAddress.RowKey;
			if ( data.memberAddress.Firstname != req.body.firstname.trim() ||
				data.memberAddress.Lastname != req.body.lastname.trim() ||
				data.memberAddress.ContactName != req.body.contactName ||
				data.memberAddress.Mobile != req.body.mobile.trim() ||
				data.memberAddress.ShopName != req.body.shopName ||
				data.memberAddress.Address != req.body.address.trim() ||
				data.memberAddress.Address2 != req.body.address2 ||
				data.memberAddress.SubDistrict != req.body.subDistrict.trim() ||
				data.memberAddress.District != req.body.district.trim() ||
				data.memberAddress.Province != req.body.province.trim() ||
				data.memberAddress.Zipcode != req.body.zipcode.trim()) {
				updateAddress = true;				

				//update selected
				var task = { PartitionKey: {'_': data.shop+'-'+data.memberId}, RowKey: {'_': data.memberAddress.ID}, Selected: {'_': false} };
				var batch = new data.azure.TableBatch();
				batch.mergeEntity(task, {echoContent: true});
				data.table.executeBatch('MemberAddress', batch, function (error, result, response) {  if(error) console.log(error); });
			}
		}

		if ( typeof data.memberAddress == 'undefined' || updateAddress ) {
			data.memberAddress = {};
			data.memberAddress.PartitionKey = {'_': data.shop+'-'+data.memberId};
			data.memberAddress.RowKey = {'_': ''+(parseInt(addressId)+1)};
			data.memberAddress.Firstname = {'_': req.body.firstname.trim()};
			data.memberAddress.Lastname = {'_': req.body.lastname.trim()};
			data.memberAddress.ContactName = {'_': req.body.contactName};
			data.memberAddress.Mobile = {'_': req.body.mobile.trim().replace(/-/g, '')};
			data.memberAddress.ShopName = {'_': req.body.shopName};
			data.memberAddress.Address = {'_': req.body.address.trim()};
			data.memberAddress.Address2 = {'_': req.body.address2};
			data.memberAddress.SubDistrict = {'_': req.body.subDistrict.trim()};
			data.memberAddress.District = {'_': req.body.district.trim()};
			data.memberAddress.Province = {'_': req.body.province.trim()};
			data.memberAddress.Zipcode = {'_': req.body.zipcode.trim()};
			data.memberAddress.Selected = {'_': true};

			//## - - - - BEGIN เพิ่มข้อมูลที่อยู่  - - - - ##//
			var batch = new data.azure.TableBatch();
			batch.insertOrMergeEntity(data.memberAddress, {echoContent: true});
			data.table.executeBatch('MemberAddress', batch, function (error, result, response) {  if(error) console.log(error); });
			//## - - - - END เพิ่มข้อมูลที่อยู่ - - - - ##//

			data.memberAddress =data.util.renderAllData(data.memberAddress);
			data.memberAddress.ID = data.memberAddress.RowKey;
			delete data.memberAddress.PartitionKey;
			delete data.memberAddress.RowKey;
			delete data.memberAddress.Selected;
		}
		
		data.table.retrieveEntity(data.tableName, data.shop, data.memberId, function(error, resultCart, response){ // อ่านค่าข้อมูลสินค้าในรถเข็น
			var json = {};
			if (!error) { // มีข้อมูล	

				//## - - - - BEGIN เพิ่มข้อมูลคำสั่งซื้อ  - - - - ##//
				data.table.retrieveEntity('Order', data.shop, 'MaxID', function(error, result, response){

					var expire = new Date();
					if (typeof data.shopConfig.OrderExpire == 'undefined') {
						data.shopConfig.OrderExpire = {};
						data.shopConfig.OrderExpire.Type = 'D';
						data.shopConfig.OrderExpire.Value = 2;
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(data.shopConfig)} };
						var batch = new data.azure.TableBatch();
						batch.insertOrMergeEntity(task, {echoContent: true});
						data.table.executeBatch('Shop', batch, function (error, result, response) {  if(error) console.log(error); });
					}					
					if ( data.shopConfig.OrderExpire.Type == 'D' ) expire.setDate(expire.getDate() + data.shopConfig.OrderExpire.Value);
					else expire.setHours(expire.getHours() + data.shopConfig.OrderExpire.Value);

					
					if (typeof data.shopConfig.OrderNumberLength == 'undefined') {
						data.shopConfig.OrderNumberLength = 4;
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'Config'}, Name: {'_': JSON.stringify(data.shopConfig)} };
						var batch = new data.azure.TableBatch();
						batch.insertOrMergeEntity(task, {echoContent: true});
						data.table.executeBatch('Shop', batch, function (error, result, response) {  if(error) console.log(error); });
					}

					
					var d = new Date();
					var m = (d.getMonth()+1).toString();
					m = m[1]? m : '0'+m;
					var orderNo = parseInt(d.getFullYear().toString().substr(2)+m+data.util.paddingNumber(1, data.shopConfig.OrderNumberLength))
					if(!error && result.Name._.toString().substr(2,2) == m) { // มีค่า MaxID และเลขเดือนเท่ากัน
						orderNo = result.Name._ + 1;
					}

					data.json.orderNo = ''+orderNo;
					data.json.accessKey = d.getTime().toString().substr(9);
					data.json.orderExpiryDate = expire;
					data.json.return = true;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);

					var task = { PartitionKey: {'_': data.shop+'-'+data.memberId}, RowKey: {'_': ''+orderNo}, Member: {'_': data.memberId}, Address: {'_': JSON.stringify(data.memberAddress)},
						Header: {'_': resultCart.Header._}, Detail: {'_': resultCart.Detail._}, Brand: {'_': resultCart.Brand._}, Category: {'_': resultCart.Category._},
						AccessKey: {'_': data.json.accessKey}, OrderDate: {'_': new Date()}, ExpiryDate: {'_': expire}, ShippingPrice: {'_': 0},
						isPrint: {'_': false}, isPay: {'_': false}, isPack: {'_': false}, isShip: {'_': false}, isExpire: {'_': false}, isCancel: {'_': false}, Active: {'_': true}
						};

					var batch = new data.azure.TableBatch();
					batch.insertOrMergeEntity(task, {echoContent: true});
					data.table.executeBatch('Order', batch, function (error, result, response) {  if(error) console.log(error); });
					
					//## - - - - BEGIN เพิ่มค่า MaxID - - - - ##//
					task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': orderNo} };
					batch = new data.azure.TableBatch();
					batch.insertOrMergeEntity(task, {echoContent: true});
					data.table.executeBatch('Order', batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
					//## - - - - END เพิ่มค่า MaxID - - - - ##//
					
					//## - - - - BEGIN ลบข้อมูล Cart - - - - ##//
					var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId} };
					var batch = new data.azure.TableBatch();
					batch.deleteEntity(task, {echoContent: true});
					data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) console.log(error); });
					//## - - - - END ลบข้อมูล Cart - - - - ##//

				});
				//## - - - - END เพิ่มข้อมูลคำสั่งซื้อ - - - - ##//
			}
			else { // ไม่มีข้อมูล
				data.json.return = true;
				data.json.error = 'CRT0007';
				data.json.errorMessage = 'Cart is empty';
				data.util.responseJson(req, res, data.json);
			}
		});
	}
};

//## Utilities Method ##//