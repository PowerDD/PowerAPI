exports.action = function(req, res, data) {
	data.tableName = 'Product';
	data.arrayNameList = '|Featured|InTheBox|Youtube|DescriptionImage|Tag|Color|'; // ชื่อ Entity ที่เป็น Array;
	data.arrayRejectList = '|PartitionKey|RowKey|Timestamp|'; // ชื่อ Entity ที่ไม่ต้องการให้ส่งข้อมูล;
	data.arrayEntityList = '|ID|Name|SKU|BuyerCode|Barcode|Location|Active|Visible|Description|Featured|InTheBox|Youtube|DescriptionImage|CoverImage|Color|Image1|Image2|Image3|Image4|Image5|Image6|Image7|Image8|Image9|Image10|Tag|BrandId|Brand|Category|CategoryId|Warranty|Cost|Price|Price1|Price2|Price3|Price4|Price5|Width|Length|Height|Weight|GrossWeight|Stock|OnCart|OnOrder|Rating|ReviewCount|View|'; // ชื่อ Entity ทั้งหมด
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.type != 'undefined' && req.body.type != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				var type = '|item|category|categoryUrl|brand|brandUrl|all|'; // ชื่อ type ที่สามารถเรียกดูข้อมูลได้
				if ( type.indexOf('|'+req.body.type+'|') == -1 ) { // ถ้าชื่อ Entity ไม่ถูกต้อง
					data.json.return = true;
					data.json.error = 'PRD0001';
					data.json.errorMessage = 'Unknown type ' + req.body.type;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
			}
		}
		else if (data.action == 'add'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.name != 'undefined' && req.body.name != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'update'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.id != 'undefined' && req.body.id != '' &&
				typeof req.body.entity != 'undefined' && req.body.entity != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'delete'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.id != 'undefined' && req.body.id != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'category_brand'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '') {
				data.json.return = false;
				data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'all'){
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
	if (data.action == 'info') { // ข้อมูลทั่วไป
		if (req.body.type == 'item'){ // รายละเอียดสินค้ารายตัว
			if (typeof req.body.entity != 'undefined' && req.body.entity != ''){ // ถ้าระบุคอลัมน์มา
				var checker = data.util.renderEntity(req.body.entity, data.arrayEntityList);
				if (!checker.success) {
					data.json.return = true;
					data.json.error = 'PRD0004';
					data.json.errorMessage = 'Entity ' + checker.entityError + ' not found';
					data.util.responseJson(req, res, data.json);
				}
				else {
					var query = new data.azure.TableQuery().select(checker.entityList).where('PartitionKey eq ?', data.shop)
						.and('RowKey eq ?', data.util.paddingNumber(parseInt(req.body.value), 8));
					data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
						if(!error){
							if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล
								data.json.result = data.util.renderData(result.entries[0], data);
								if ( typeof data.json.result.Brand != 'undefined' && data.json.result.Brand != '' )
									exports.getItemBrand(req, res, data);
								else if ( typeof data.json.result.Category != 'undefined' && data.json.result.Category != '' )
									exports.actionAfterGetItemCategory(req, res, data);
								else {
									data.json.return = true;
									data.json.success = true;
									data.util.responseJson(req, res, data.json);
								}
							}
							else {// ไม่มีข้อมูลในระบบ
								data.json.return = true;
								data.json.error = 'PRD0002';
								data.json.errorMessage = 'Product ID ' + req.body.value + ' not found';
								data.util.responseJson(req, res, data.json);
							}
						}
						else {
							data.util.responseError(req, res, error);
						}
					});
					/*data.json.return = true;
					data.json.entityList = entityList;
					data.json.error = 'PRD0003';
					data.json.errorMessage = 'ยังทำไม่เสร็จ รอก่อน !!!';
					data.util.responseJson(req, res, data.json);*/
				}
			}
			else { // ถ้าไม่ระบุคอลัมน์ของข้อมูลที่ต้องการมา
				data.table.retrieveEntity(data.tableName, data.shop, data.util.paddingNumber(parseInt(req.body.value), 8), function(error, result, response){				
					if(!error) { // มีข้อมูลในระบบ
						data.json.result = data.util.renderData(result, data);
						if ( data.json.result.Brand != '' )
							exports.getItemBrand(req, res, data);
						else if ( data.json.result.Category != '' )
							exports.actionAfterGetItemCategory(req, res, data);
						else {
							data.json.return = true;
							data.json.success = true;
							data.util.responseJson(req, res, data.json);
						}
					}
					else { // ไม่มีข้อมูลในระบบ
						data.json.return = true;
						data.json.error = 'PRD0002';
						data.json.errorMessage = 'Product ID ' + req.body.value + ' not found';
						data.util.responseJson(req, res, data.json);
					}				
				});
			}
		}
		else if (req.body.type == 'category'){ // ค้นหาสินค้าตามหมวดหมู่
			data.json.return = true;
			data.json.error = 'PRD0003';
			data.json.errorMessage = 'ยังทำไม่เสร็จ รอก่อน !!!';
			data.util.responseJson(req, res, data.json);
		}
		else if (req.body.type == 'categoryUrl'){ // ค้นหาสินค้าตามลิงค์หมวดหมู่
			exports.getAllBrand(req, res, data);
		}
		else if (req.body.type == 'brand'){ // ค้นหาสินค้าตามยี่ห้อ
			data.json.return = true;
			data.json.error = 'PRD0003';
			data.json.errorMessage = 'ยังทำไม่เสร็จ รอก่อน !!!';
			data.util.responseJson(req, res, data.json);
		}
		else if (req.body.type == 'brandUrl'){ // ค้นหาสินค้าตามลิงค์ยี่ห้อ
			exports.getAllCategory(req, res, data);			
			/*data.json.return = true;
			data.json.error = 'PRD0003';
			data.json.errorMessage = 'ยังทำไม่เสร็จ รอก่อน !!!';
			data.util.responseJson(req, res, data.json);*/
		}
		else if (req.body.type == 'all'){ 
			exports.getAllBrand(req, res, data);
		}
	}
	else if (data.action == 'add') { // เพิ่มข้อมูล
		data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
			if(!error){
				
				data.table.retrieveEntity(data.tableName, data.shop, 'MaxID', function(error, result, response){
					if(!error) { // มีค่า MaxID แล้ว
						var id = result.Name._ +1;

						//## - - - - BEGIN เพิ่มข้อมูล - - - - ##//
						var brand = typeof req.body.brand == 'undefined' || req.body.brand == '' ?						'00000' : (isNaN(Number(req.body.brand)) ? '00000' : data.util.paddingNumber(parseInt(req.body.brand), 5));
						var category = typeof req.body.category == 'undefined' || req.body.category == '' ?	'00000' : (isNaN(Number(req.body.category)) ? '00000' : data.util.paddingNumber(parseInt(req.body.category), 5));

						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.util.paddingNumber(id, 8) },
							Name: {'_': req.body.name.trim()},
							SKU: {'_': typeof req.body.sku == 'undefined' || req.body.sku == '' ?												null : req.body.sku.trim()},
							BuyerCode: {'_': typeof req.body.buyerCode == 'undefined' || req.body.buyerCode == '' ?	null : req.body.buyerCode.trim()},
							Barcode: {'_': typeof req.body.barcode == 'undefined' || req.body.barcode == '' ?					null : req.body.barcode.trim()},
							Location: {'_': typeof req.body.location == 'undefined' || req.body.location == '' ?					null : req.body.location.trim()},
							Active: {'_': typeof req.body.active == 'undefined' || req.body.active == '' ?								false : req.body.active == '1'},
							Visible: {'_': typeof req.body.visible == 'undefined' || req.body.visible == '' ?							false : req.body.visible == '1'},
							Description: {'_': typeof req.body.description == 'undefined' || req.body.description == '' ?	null : req.body.description.trim()},
							Featured: {'_': typeof req.body.featured == 'undefined' || req.body.featured == '' ?					null : req.body.featured.trim()},
							InTheBox: {'_': typeof req.body.inTheBox == 'undefined' || req.body.inTheBox == '' ?			null : req.body.inTheBox.trim()},
							Youtube: {'_': typeof req.body.youtube == 'undefined' || req.body.youtube == '' ?					null : req.body.youtube.trim()},
							DescriptionImage: {'_': typeof req.body.descriptionImage == 'undefined' || req.body.descriptionImage == '' ?		null : req.body.descriptionImage.trim()},
							CoverImage: {'_': typeof req.body.coverImage == 'undefined' || req.body.coverImage == '' ?											null : req.body.coverImage.trim()},
							Color: {'_': typeof req.body.color == 'undefined' || req.body.color == '' ?										null : req.body.color.trim()},
							Image1: {'_': typeof req.body.image1 == 'undefined' || req.body.image1 == '' ?						null : req.body.image1.trim()},
							Image2: {'_': typeof req.body.image2 == 'undefined' || req.body.image2 == '' ?						null : req.body.image2.trim()},
							Image3: {'_': typeof req.body.image3 == 'undefined' || req.body.image3 == '' ?						null : req.body.image3.trim()},
							Image4: {'_': typeof req.body.image4 == 'undefined' || req.body.image4 == '' ?						null : req.body.image4.trim()},
							Image5: {'_': typeof req.body.image5 == 'undefined' || req.body.image5 == '' ?						null : req.body.image5.trim()},
							Image6: {'_': typeof req.body.image6 == 'undefined' || req.body.image6 == '' ?						null : req.body.image6.trim()},
							Image7: {'_': typeof req.body.image7 == 'undefined' || req.body.image7 == '' ?						null : req.body.image7.trim()},
							Image8: {'_': typeof req.body.image8 == 'undefined' || req.body.image8 == '' ?						null : req.body.image8.trim()},
							Image9: {'_': typeof req.body.image9 == 'undefined' || req.body.image9 == '' ?						null : req.body.image9.trim()},
							Image10: {'_': typeof req.body.image10 == 'undefined' || req.body.image10 == '' ?				null : req.body.image10.trim()},
							Tag: {'_': typeof req.body.tag == 'undefined' || req.body.tag == '' ?												null : req.body.tag.trim()},
							Brand: {'_': brand},
							Category: {'_': category},
							Warranty: {'_': isNaN(Number(req.body.warranty)) || typeof req.body.warranty == 'undefined' || req.body.warranty == '' ?	0 : parseInt(req.body.warranty)},
							Cost: {'_': isNaN(Number(req.body.cost)) || typeof req.body.cost == 'undefined' || req.body.cost == '' ?				0 : parseFloat(req.body.cost)},
							Price: {'_': isNaN(Number(req.body.price)) || typeof req.body.price == 'undefined' || req.body.price == '' ?			0 : parseFloat(req.body.price)},
							Price1: {'_': isNaN(Number(req.body.price1)) || typeof req.body.price1 == 'undefined' || req.body.price1 == '' ?		0 : parseFloat(req.body.price1)},
							Price2: {'_': isNaN(Number(req.body.price2)) || typeof req.body.price2 == 'undefined' || req.body.price2 == '' ?		0 : parseFloat(req.body.price2)},
							Price3: {'_': isNaN(Number(req.body.price3)) || typeof req.body.price3 == 'undefined' || req.body.price3 == '' ?		0 : parseFloat(req.body.price3)},
							Price4: {'_': isNaN(Number(req.body.price4)) || typeof req.body.price4 == 'undefined' || req.body.price4 == '' ?		0 : parseFloat(req.body.price4)},
							Price5: {'_': isNaN(Number(req.body.price5)) || typeof req.body.price5 == 'undefined' || req.body.price5 == '' ?		0 : parseFloat(req.body.price5)},
							Width: {'_': isNaN(Number(req.body.width)) || typeof req.body.width == 'undefined' || req.body.width == '' ?			0 : parseFloat(req.body.width)},
							Length: {'_': isNaN(Number(req.body.length)) || typeof req.body.length == 'undefined' || req.body.length == '' ?	0 : parseFloat(req.body.length)},
							Height: {'_': isNaN(Number(req.body.height)) || typeof req.body.height == 'undefined' || req.body.height == '' ?		0 : parseFloat(req.body.height)},
							Weight: {'_': isNaN(Number(req.body.weight)) || typeof req.body.weight == 'undefined' || req.body.weight == '' ?	0 : parseFloat(req.body.weight)},
							GrossWeight: {'_': isNaN(Number(req.body.grossWeight)) || typeof req.body.grossWeight == 'undefined' || req.body.grossWeight == '' ? 0 : parseFloat(req.body.grossWeight)},
							Stock: {'_': isNaN(Number(req.body.stock)) || typeof req.body.stock == 'undefined' || req.body.stock == '' ?						0 : parseInt(req.body.stock)},
							OnCart: {'_': isNaN(Number(req.body.onCart)) || typeof req.body.onCart == 'undefined' || req.body.onCart == '' ?				0 : parseInt(req.body.onCart)},
							OnOrder: {'_': isNaN(Number(req.body.onOrder)) || typeof req.body.onOrder == 'undefined' || req.body.onOrder == '' ?		0 : parseInt(req.body.onOrder)},
							Rating: {'_': isNaN(Number(req.body.rating)) || typeof req.body.rating == 'undefined' || req.body.rating == '' ?					0 : parseFloat(req.body.rating)},
							ReviewCount: {'_': isNaN(Number(req.body.reviewCount)) || typeof req.body.reviewCount == 'undefined' || req.body.reviewCount == '' ?	0 : parseInt(req.body.reviewCount)},
							AddDate: {'_': typeof req.body.addDate == 'undefined' || req.body.addDate == '' ?	new Date() : new Date(req.body.addDate.trim())}
						};
						var batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) { 
							if(error)
								data.util.responseError(req, res, error);
							else
								data.json.return = true;
								data.json.success = true;
								data.json.id = data.util.paddingNumber(id, 8);
								data.util.responseJson(req, res, data.json);
								// เพิ่มค่าจำนวนสินค้าในยี่ห้อและหมวดหมู่
								if ( category != '' )
									data.util.updateEntityNumber(req, res, data, 'Category', data.shop, category, 'ProductCount', 1);
								if ( brand != '' )
									data.util.updateEntityNumber(req, res, data, 'Brand', data.shop, brand, 'ProductCount', 1);
						});
						//## - - - - END เพิ่มข้อมูล - - - - ##//
						
						//## - - - - BEGIN เพิ่มค่า MaxID - - - - ##//
						task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': id} };
						batch = new data.azure.TableBatch();
						batch.updateEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
						//## - - - - END เพิ่มค่า MaxID - - - - ##//

					}
					else { // ไม่มีค่า MaxID
						//## - - - - BEGIN ถ้าไม่เคยมีการกำหนดค่า MaxID  - - - - ##//
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': 0} };
						var batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else 
							exports.actionAfterGetShop(req, res, data); // เรียก Function นี้ซ้ำ
						});
						//## - - - - END ถ้าไม่เคยมีการกำหนดค่า MaxID - - - - ##//
					}

				});

			}
			else { // End Create Table
				data.util.responseError(req, res, error);			
			}
		});
	}
	else if (data.action == 'update') { // แก้ไขข้อมูล
		var id = data.util.paddingNumber(parseInt( req.body.id ), 8); // รหัสข้อมูล
		data.table.retrieveEntity(data.tableName, data.shop, id, function(error, result, response){
			if(!error){ // ถ้ามีข้อมลในระบบแล้ว

					var checker = data.util.renderEntity(req.body.entity, data.arrayEntityList);
					if (!checker.success) {
						data.json.return = true;
						data.json.error = 'PRD0004';
						data.json.errorMessage = 'Entity ' + checker.entityError + ' not found';
						data.util.responseJson(req, res, data.json);
					}
					else {
						var sp = req.body.value.split(',');
						sp = sp.filter(function(n){ return n !== ''; });
						if (sp.length != checker.entityList.length) {
							data.json.return = true;
							data.json.error = 'PRD0006';
							data.json.errorMessage = 'Entity length does not match entity value length ['+checker.entityList.length+'/'+sp.length+']';
							data.util.responseJson(req, res, data.json);							
						}
						else {
							// แปลงชนิดข้อมูลให้ถูกต้อง
							var integer = '|Warranty|Cost|Price|Price1|Price2|Price3|Price4|Price5|Width|Length|Height|Weight|GrossWeight|Stock|OnCart|OnOrder|Rating|ReviewCount|View|'; // ข้อมูลตัวเลข
							var bool = '|Active|Visible|'; // ข้อมูล boolean
							var padding = '|Brand|Category|'; // ข้อมูลที่ต้องแปลงเป็น Id

							var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': id} };
							for(i=0; i<sp.length; i++){
								if ( integer.indexOf('|'+checker.entityList[i]+'|') != -1 ) {
									task[checker.entityList[i]] = {'_': isNaN(Number(sp[i])) || typeof sp[i] == 'undefined' || sp[i] == '' ? 0 : parseFloat(sp[i])};
								}
								else if ( bool.indexOf('|'+checker.entityList[i]+'|') != -1 ) {
									task[checker.entityList[i]] = {'_': typeof sp[i] == 'undefined' || sp[i] == '' ? false : (sp[i] == '1')};
								}
								else if ( padding.indexOf('|'+checker.entityList[i]+'|') != -1 ) {
									task[checker.entityList[i]] = {'_': isNaN(Number(sp[i])) || typeof sp[i] == 'undefined' || sp[i] == '' ? '00000' : data.util.paddingNumber(parseInt(sp[i]), 5)};
								}
								else {
									task[checker.entityList[i]] = {'_': typeof sp[i] == 'undefined' || sp[i] == '' ? '' : sp[i].trim()};
								}
							}
							//## - - - - BEGIN แก้ไขข้อมูล - - - - ##//
							var batch = new data.azure.TableBatch();
							batch.mergeEntity(task, {echoContent: true});
							data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
								data.json.return = true;
								data.json.success = true;
								data.util.responseJson(req, res, data.json);
							}});
							//## - - - - END แก้ไขข้อมูล - - - - ##//
						}
					}
			}
			else { // ถ้าไม่มีข้อมลในระบ
				data.json.return = true;
				data.json.error = 'PRD0002';
				data.json.errorMessage = 'Product ID ' + req.body.value + ' not found';
				data.util.responseJson(req, res, data.json);
			}			
		});
	}
	else if (data.action == 'delete') { // ลบข้อมูล
		var id = data.util.paddingNumber(parseInt( req.body.id ), 8); // รหัสข้อมูล
		var query = new data.azure.TableQuery().select(['Brand', 'Category']).where('PartitionKey eq ?', data.shop).and('RowKey eq ?', id);
		data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
			if(!error){
				if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล

					var category = result.entries[0].Category._;
					var brand = result.entries[0].Brand._;

					//## - - - - BEGIN ลบข้อมูล - - - - ##//
					var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': id} };
					var batch = new data.azure.TableBatch();
					batch.deleteEntity(task, {echoContent: true});
					data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
						data.json.return = true;
						data.json.success = true;
						data.util.responseJson(req, res, data.json);

						// ลดค่าจำนวนสินค้าในยี่ห้อและหมวดหมู่
						if ( category != '' )
							data.util.updateEntityNumber(req, res, data, 'Category', data.shop, category, 'ProductCount', -1);
						if ( brand != '' )
							data.util.updateEntityNumber(req, res, data, 'Brand', data.shop, brand, 'ProductCount', -1);

					}});
					//## - - - - END ลบข้อมูล - - - - ##//
				}
				else { // ถ้าไม่มีข้อมลในระบ
					data.json.return = true;
					data.json.error = 'PRD0002';
					data.json.errorMessage = 'Product ID ' + req.body.id + ' not found';
					data.util.responseJson(req, res, data.json);
				}
			}
			else { // ถ้าไม่มีข้อมลในระบ
				data.util.responseError(req, res, error);
			}
		});
	}
	else if (data.action == 'category_brand') {
		exports.getAllBrand(req, res, data);
	}
	else if (data.action == 'all') {
		if(typeof req.body.memberKey != 'undefined' && req.body.memberKey != ''){
			data.util.getMemberId(req, res, data);
		}else{
			exports.getAllBrand(req, res, data);
		}
	}
};

exports.actionAfterGetMemberId = function(req, res, data) {
	if (data.action == 'all') { 
		exports.getSelectedMemberType(req, res, data);
	}
};

exports.actionAfterGetItemBrand = function(req, res, data) {
	data.json.result.Brand = data.brand;
	data.json.result.BrandUrl = data.brandUrl;
	exports.getItemCategory(req, res, data);
};

exports.actionAfterGetItemCategory = function(req, res, data) {
	data.json.result.Category = data.category;
	data.json.result.CategoryUrl = data.categoryUrl;
	data.json.return = true;
	data.json.success = true;
	data.util.responseJson(req, res, data.json);
};

//## Utilities Method ##//
exports.getItemBrand = function(req, res, data) {
	data.table.retrieveEntity('Brand', data.shop, data.util.paddingNumber(parseInt(data.json.result.Brand), 5), function(error, result, response){
		if(!error) { // มีข้อมูลในระบบ
			data.brand = result.Name._;
			data.brandUrl = result.Url._;
		}
		else { // ไม่มีข้อมูลในระบบ
			data.brandId = ''
			data.brand = '';
			data.brandUrl = '';
		}
		data.object.actionAfterGetItemBrand(req, res, data);
	});
};

exports.getItemCategory = function(req, res, data) {
	data.table.retrieveEntity('Category', data.shop, data.util.paddingNumber(parseInt(data.json.result.Category), 5), function(error, result, response){
		if(!error) { // มีข้อมูลในระบบ
			data.category = result.Name._;
			data.categoryUrl = result.Url._;
			
		}
		else { // ไม่มีข้อมูลในระบบ
			data.category = '';
			data.categoryUrl = '';
		}
		data.object.actionAfterGetItemCategory(req, res, data);
	});
};

exports.getAllBrand = function(req, res, data) { // ค้นหายี่ห้อทั้งหมด เพื่อรอ Map กับสินค้า	
	var query = new data.azure.TableQuery().select(['RowKey', 'Name', 'Priority']).where('PartitionKey eq ?', data.shop).and('RowKey ne ?', 'MaxID');
	data.table.queryEntities('Brand',query, null, function(error, result, response) {
		if(!error){

			if ( result.entries.length != 0 ) {
				data.brand = {};
				for(i=0; i<result.entries.length; i++){
					data.brand[result.entries[i].RowKey._] = {};
					data.brand[result.entries[i].RowKey._].Id = result.entries[i].RowKey._;
					data.brand[result.entries[i].RowKey._].Name = result.entries[i].Name._;
					data.brand[result.entries[i].RowKey._].Priority = result.entries[i].Priority._;
					//data.brand[result.entries[i].RowKey._].Url = result.entries[i].Url._;
				}
			}
			
			if (req.body.type == 'categoryUrl'){
				exports.getCategoryByUrl(req, res, data);
			}
			else if(req.body.type == 'all' || data.action == 'category_brand' || data.action == 'all'){
				exports.getAllCategory(req, res, data);
			}
			else {
				exports.getCategoryById(req, res, data);
			}

		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.getAllCategory = function(req, res, data) { // ค้นหาประเภทสินค้าทั้งหมด เพื่อรอ Map กับสินค้า
	var query = new data.azure.TableQuery().select(['RowKey', 'Name', 'Priority']).where('PartitionKey eq ?', data.shop).and('RowKey ne ?', 'MaxID');
	data.table.queryEntities('Category',query, null, function(error, result, response) {
		if(!error){

			if ( result.entries.length != 0 ) {
				data.category = {};
				for(i=0; i<result.entries.length; i++){
					data.category[result.entries[i].RowKey._] = {};
					data.category[result.entries[i].RowKey._].Id = result.entries[i].RowKey._;
					data.category[result.entries[i].RowKey._].Name = result.entries[i].Name._;
					data.category[result.entries[i].RowKey._].Priority = result.entries[i].Priority._;
					//data.brand[result.entries[i].RowKey._].Url = result.entries[i].Url._;
				}
			}
			
			if (req.body.type == 'brandUrl'){
				exports.getBrandByUrl(req, res, data);
			}
			else if(req.body.type == 'all' || data.action == 'category_brand' || data.action == 'all'){
				exports.getAllProduct(req, res, data);
			}
			else {
				exports.getBrandById(req, res, data);
			}

		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.getCategoryByUrl = function(req, res, data) { // ค้นหาสินค้าตามลิงค์ยี่ห้อ
	var query = new data.azure.TableQuery().select(['RowKey', 'Name']).top(1).where('PartitionKey eq ?', data.shop).and('Url eq ?', req.body.value);
	data.table.queryEntities('Category',query, null, function(error, result, response) {
		if(!error){			
			if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
				data.json.return = true;
				data.json.success = true;
				data.json.result = [];
				data.util.responseJson(req, res, data.json);
			}
			else {
				req.body.value = result.entries[0].RowKey._;
				data.json.categoryId = result.entries[0].RowKey._;
				data.json.categoryName = result.entries[0].Name._;
				exports.getCategoryById(req, res, data);
			}			
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.getBrandByUrl = function(req, res, data) { // ค้นหาสินค้าตามลิงค์ยี่ห้อ
	var query = new data.azure.TableQuery().select(['RowKey', 'Name']).top(1).where('PartitionKey eq ?', data.shop).and('Url eq ?', req.body.value);
	data.table.queryEntities('Brand',query, null, function(error, result, response) {
		if(!error){			
			if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
				data.json.return = true;
				data.json.success = true;
				data.json.result = [];
				data.util.responseJson(req, res, data.json);
			}
			else {
				req.body.value = result.entries[0].RowKey._;
				data.json.brandName = result.entries[0].Name._;
				exports.getBrandById(req, res, data);
			}			
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.getCategoryById = function(req, res, data) { // ค้นหาสินค้าตามลิงค์ยี่ห้อ
	
	var entityList = ['RowKey', 'Name', 'SKU', 'Brand', 'Warranty', 'Active', 'AddDate', 'Visible', 'Description', 'Price', 'Price1', 'Price2', 'Price3', 'Price4', 'Price5', 'Price6', 'Price7', 'Price8', 'Stock', 'OnCart', 'OnOrder', 'CoverImage'];
	if (typeof req.body.entity != 'undefined' && req.body.entity != ''){ // ถ้าระบุคอลัมน์มา
		var checker = data.util.renderEntity(req.body.entity, data.arrayEntityList);
		if (!checker.success) {
			data.json.return = true;
			data.json.error = 'PRD0004';
			data.json.errorMessage = 'Entity ' + checker.entityError + ' not found';
			data.util.responseJson(req, res, data.json);
		}
		else {
			entityList = checker.entityList;
		}
	}

	var subQuery = (req.body.active == '1' || typeof req.body.active == 'undefined' || req.body.active == '') ? ' and Active eq true' : ((req.body.active == '0') ? ' and Active eq false' : '');
	subQuery += (req.body.visible == '1' || typeof req.body.visible == 'undefined' || req.body.visible == '') ? ' and Visible eq true' : ((req.body.visible == '0') ? ' and Visible eq false' : '');

	var query = new data.azure.TableQuery().select(entityList).where('PartitionKey eq ?', data.shop).and('RowKey ne ?', 'MaxID').and('Category eq ?'+subQuery, req.body.value);
	data.table.queryEntities('Product',query, null, function(error, result, response) {
		if(!error){
			data.json.return = true;
			data.json.success = true;
			if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
				data.json.result = [];
			}
			else {
				//## - - - - BEGIN แปลงข้อมูล - - - - ##//
				data.arrayRejectList = '|PartitionKey|Timestamp|';
				var array = [];
				for ( var i=0; i<result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.ID = obj.RowKey;

					if (typeof obj.Brand != 'undefined' && typeof data.brand[obj.Brand] != 'undefined') {
						obj.BrandId = data.brand[obj.Brand].Id;
						obj.Brand = data.brand[obj.Brand].Name;
						//obj.BrandUrl = data.brand[obj.Brand].Url;						
					}						
					delete obj.RowKey;
					array.push(obj);
				}
				//## - - - - END แปลงข้อมูล - - - - ##//
				// เรียงลำดับข้อมูล
				array.sort( data.util.orderJsonInt('Price1') );

				data.json.success = true;
				data.json.result = array;
			}
			data.util.responseJson(req, res, data.json);
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.getBrandById = function(req, res, data) { // ค้นหาสินค้าตามลิงค์ยี่ห้อ
	
	var entityList = ['RowKey', 'Name', 'SKU', 'Category', 'Warranty', 'Active', 'Visible', 'Description', 'Price', 'Price1', 'Stock', 'OnCart', 'OnOrder', 'CoverImage'];
	if (typeof req.body.entity != 'undefined' && req.body.entity != ''){ // ถ้าระบุคอลัมน์มา
		var checker = data.util.renderEntity(req.body.entity, data.arrayEntityList);
		if (!checker.success) {
			data.json.return = true;
			data.json.error = 'PRD0004';
			data.json.errorMessage = 'Entity ' + checker.entityError + ' not found';
			data.util.responseJson(req, res, data.json);
		}
		else {
			entityList = checker.entityList;
		}
	}

	var subQuery = (req.body.active == '1' || typeof req.body.active == 'undefined' || req.body.active == '') ? ' and Active eq true' : ((req.body.active == '0') ? ' and Active eq false' : '');
	subQuery += (req.body.visible == '1' || typeof req.body.visible == 'undefined' || req.body.visible == '') ? ' and Visible eq true' : ((req.body.visible == '0') ? ' and Visible eq false' : '');

	var query = new data.azure.TableQuery().select(entityList).where('PartitionKey eq ?', data.shop).and('RowKey ne ?', 'MaxID').and('Brand eq ?'+subQuery, req.body.value);
	data.table.queryEntities('Product',query, null, function(error, result, response) {
		if(!error){
			data.json.return = true;
			data.json.success = true;
			if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
				data.json.result = [];
			}
			else {
				//## - - - - BEGIN แปลงข้อมูล - - - - ##//
				data.arrayRejectList = '|PartitionKey|Timestamp|';
				var array = [];				
				for ( var i=0; i<result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.ID = obj.RowKey;

					if (typeof obj.Category != 'undefined' && typeof data.category[obj.Category] != 'undefined') {
						obj.Category = data.category[obj.Category].Name;
						//obj.BrandUrl = data.brand[obj.Brand].Url;
					}
					delete obj.RowKey;
					array.push(obj);
				}
				//## - - - - END แปลงข้อมูล - - - - ##//
				// เรียงลำดับข้อมูล
				array.sort( data.util.orderJsonString('Category') );

				data.json.success = true;
				data.json.result = array;
			}
			data.util.responseJson(req, res, data.json);
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};
exports.getAllProduct = function(req, res, data) { 
	var entityList = [];
	var List = ['RowKey', 'Name', 'SKU', 'Category', 'Brand', 'Warranty', 'Active', 'AddDate', 'Visible', 'Description', 'CoverImage','Price', 'Price1', 'Price2', 'Stock', 'OnCart', 'OnOrder'];
	if(typeof data.memberPrice != 'undefined' && data.memberPrice !=''){	
		entityList = List.concat(data.memberPrice); // Price From SellPrice
	}
	else{
		entityList = List;
	}
		
	var subQuery = (req.body.active == '1' || typeof req.body.active == 'undefined' || req.body.active == '') ? ' and Active eq true' : ((req.body.active == '0') ? ' and Active eq false' : '');
	subQuery += (req.body.visible == '1' || typeof req.body.visible == 'undefined' || req.body.visible == '') ? ' and Visible eq true' : ((req.body.visible == '0') ? ' and Visible eq false' : '');

	var query = new data.azure.TableQuery().select(entityList).where('PartitionKey eq ?', data.shop).and('RowKey ne ?'+subQuery, 'MaxID')
	data.table.queryEntities('Product',query, null, function(error, result, response) {
		if(!error){
			data.json.return = true;
			data.json.success = true;
			if ( result.entries.length == 0 ) { // ถ้าไม่มีข้อมูล
				data.json.result = [];
			}
			else {
				//## - - - - BEGIN แปลงข้อมูล - - - - ##//
				data.arrayRejectList = '|PartitionKey|Timestamp|';
				var array = [];
				for ( var i=0; i<result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.ID = obj.RowKey;
					obj.HasStock = (obj.Stock - obj.OnCart - obj.OnOrder) > 0 ? 1 : 0;
					if (typeof obj.Brand != 'undefined' && typeof data.brand[obj.Brand] != 'undefined') {
						obj.BrandPriority = data.brand[obj.Brand].Priority;
						obj.BrandId = data.brand[obj.Brand].Id;
						obj.Brand = data.brand[obj.Brand].Name;				
						//obj.BrandUrl = data.brand[obj.Brand].Url;						
					}
					if (typeof obj.Category != 'undefined' && typeof data.category[obj.Category] != 'undefined') {
						obj.CategoryPriority = data.category[obj.Category].Priority;
						obj.CategoryId = data.category[obj.Category].Id;
						obj.Category = data.category[obj.Category].Name;							
					}
					if (typeof data.memberStep != 'undefined' && data.memberStep !='' ){
						obj.SellStep = data.memberStep.SellStep._;
						obj.SellMaxStep = data.memberStep.SellMaxStep._;
						obj.Qty1 = data.memberStep.Qty1;
						obj.Qty2 = data.memberStep.Qty2;
						obj.Qty3 = data.memberStep.Qty3;
						obj.Qty4 = data.memberStep.Qty4;
						obj.Qty5 = data.memberStep.Qty5;
					}
					if(data.selectMemberType == 'Member'){
						obj.IsSameCategory = 1; 
						obj.wholesalePrice1 = obj.Price1; 
						obj.wholesalePrice2 = obj.Price2;
						delete obj.Price1;
						delete obj.Price2;
					} 
					if(typeof data.memberPrice == 'undefined' || data.memberPrice =='') delete obj.Stock, delete obj.OnCart, delete obj.OnOrder, delete obj.Price2;
					if(obj.Qty1 == 0)delete obj.Qty1;
					if(obj.Qty2 == 0)delete obj.Qty2;
					if(obj.Qty3 == 0)delete obj.Qty3;
					if(obj.Qty4 == 0)delete obj.Qty4;
					if(obj.Qty5 == 0)delete obj.Qty5;
					
					delete obj.RowKey;
					array.push(obj);
				}
				//## - - - - END แปลงข้อมูล - - - - ##//
				// เรียงลำดับข้อมูล
				array.sort( data.util.orderJsonInt('Price1') );
				data.json.success = true;
				data.json.result = array;
			}
			if(data.action == 'category_brand'){
				exports.getCategoryAndBrand(req, res, data);
			}
			data.util.responseJson(req, res, data.json);
				
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};
exports.getCategoryAndBrand = function(req, res, data) {
	try{
		var value = data.json.result;
		var count = value.length;
		var json = [];
		var category = [];
		var brand = {};
		for(i=0; i<count; i++){
			if (category.indexOf(value[i].CategoryId) == -1) { //ถ้ายังไม่มีข้อมูล category นี้
				json.push({ CategoryId: value[i].CategoryId , Name: value[i].Category,  Priority: value[i].CategoryPriority  }); 
				category.push(value[i].CategoryId);
				brand[value[i].CategoryId] = [];
			}
			
			var brandExist = false;
			for(j=0; j<brand[value[i].CategoryId].length; j++){ // ตรวจสอบว่า brand ของ category นี้ มีหรือยัง
				if(brand[value[i].CategoryId][j].id == value[i].BrandId){
					brandExist = true;
					break;
				}
			}
			if(!brandExist){ // ถ้ายังไม่มี brand นี้ ก็เอาค่าใส่
				brand[value[i].CategoryId].push( { id: value[i].BrandId, name: value[i].Brand, priority:  value[i].BrandPriority} );
			}
			brand[value[i].CategoryId].sort( data.util.orderJsonInt('priority') );
		}
		

		var newJson = [];
		for(i=0; i<json.length; i++) { // ผูก category กับ brand เข้าด้วยกัน			
			newJson.push({ category: json[i].CategoryId, name: json[i].Name,  priority: json[i].Priority, brand: brand[json[i].CategoryId]  });
		}
		newJson.sort( data.util.orderJsonString('name') );
		data.json.return = true;
		data.json.success = true;
		data.json.result = newJson;
		data.util.responseJson(req, res, data.json);	
	}catch(error){
		data.json.return = true;
		data.util.responseError(req, res, error);
	}
};
exports.getSelectedMemberType = function(req, res, data) {
	var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.shop).and('RowKey eq ?', data.memberId); 
	data.table.queryEntities('Member',query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				data.selectMemberType = result.entries[0].SelectedMemberType._;
				exports.getMemberSellPrice(req, res, data);
			}else{
				data.json.return = true;
				data.json.success = false;
				data.json.result = '';
				data.util.responseJson(req, res, data.json);	
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});	
};
exports.getMemberSellPrice = function(req, res, data) {
	var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.shop).and('RowKey eq ?', data.selectMemberType) ;
	data.table.queryEntities('MemberPrice',query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				if (result.entries[0].SellStep._ > 0){
					var obj = {};
					obj.SellStep = result.entries[0].SellStep._;
					obj.SellMaxStep = result.entries[0].SellMaxStep._;
					obj.Qty1 = result.entries[0].Qty1._;
					obj.Qty2 = result.entries[0].Qty2._;
					obj.Qty3 = result.entries[0].Qty3._;
					obj.Qty4 = result.entries[0].Qty4._;
					obj.Qty5 = result.entries[0].Qty5._;
					obj.Price1 = result.entries[0].Price1._;
					obj.Price2 = result.entries[0].Price2._;
					obj.Price3 = result.entries[0].Price3._;
					obj.Price4 = result.entries[0].Price4._;
					obj.Price5 = result.entries[0].Price5._;					
				}				
				data.memberStep = obj;
				var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.selectMemberType);
				data.table.queryEntities('MemberType',query, null, function(error, result, response) {
					if(!error){
						if ( result.entries.length != 0 ) {
							data.memberTypeLv = parseInt(result.entries[0].RowKey._);
							var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.memberId).and('RowKey eq ?', data.selectMemberType);
							data.table.queryEntities('MemberMapping',query, null, function(error, result, response) {
								if(!error){
									if ( result.entries.length != 0 ) {
										var memberPrice = result.entries[0].SellPrice._;
										var priceArray = [];
										for(i=1; i<= memberPrice; i++){
											priceArray.push('Price'+[i]);				
										}
										data.memberPrice = priceArray;
										exports.getAllBrand(req, res, data);
									}else{
										exports.getAllBrand(req, res, data);
									}
								}
							});
						}
					}
				});
			}else{
				data.json.return = true;
				data.json.success = false;
				data.json.result = '';
				data.util.responseJson(req, res, data.json);	
			}			
		}
		else {
			data.util.responseError(req, res, error);
		}
	});	
};