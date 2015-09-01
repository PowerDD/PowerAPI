exports.action = function(req, res, data) {
	data.tableName = 'Member';
	data.arrayNameList = '';	
	data.arrayRejectList = '|PartitionKey|RowKey|Timestamp|'; // ชื่อ Entity ที่ไม่ต้องการให้ส่งข้อมูล;
	
	try {
		if (data.action == 'info'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '' ) {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'register'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.type != 'undefined' && req.body.type != '' &&
				typeof req.body.value != 'undefined' && req.body.value != '') {
				var type = '|Web|Desktop|Android|iOS|Facebook|Google|Microsoft|'; // ชื่อ type ที่สามารถเพิ่มข้อมูลได้
				if ( type.indexOf('|'+req.body.type+'|') == -1 ) { // ถ้าชื่อ type ไม่ถูกต้อง
					data.json.error = 'MBR0001';
					data.json.errorMessage = 'Unknown type ' + req.body.type;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
			}
		}
		else if (data.action == 'exist'){
			if (data.subAction[0] == 'username' || data.subAction[0] == 'email' || data.subAction[0] == 'mobile' || data.subAction[0] == 'memberKey'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
					typeof req.body[data.subAction[0]] != 'undefined' && req.body[data.subAction[0]] != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
			}
			else {
				data.json.error = 'MBR0001';
				data.json.errorMessage = 'Unknown type ' + data.subAction[0];
				data.util.responseJson(req, res, data.json);
			}
		}
		else if (data.action == 'login'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.username != 'undefined' && req.body.username != '' &&
				typeof req.body.password != 'undefined' && req.body.password != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'logout'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '' ) {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'membertype'){
			if (data.subAction[0] == 'info'){
				data.json.return = false;
				exports.getMemberTypeInfo(req, res, data);
			}
			else if (data.subAction[0] == 'add'){
				if (typeof req.body.id != 'undefined' && req.body.id != '' &&
				typeof req.body.level != 'undefined' && req.body.level != '') {
					data.json.return = false;
					exports.addMemberType(req, res, data);
				}
			}
		}
		else if (data.action == 'memberprice'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberType != 'undefined' && req.body.memberType != '' &&
				typeof req.body.sellPrice != 'undefined' && req.body.sellPrice != '') {
					data.json.return = false;
					data.util.getShop(req, res, data);					
			}
		}
		else if (data.action == 'mapping'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberId != 'undefined' && req.body.memberId != '' &&
				typeof req.body.memberType != 'undefined' && req.body.memberType != '' ) {
					data.json.return = false;
					data.util.getShop(req, res, data);
			}
		}
		else if (data.action == 'role'){
			if (data.subAction[0] == 'info'){
				if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '' ) {
					data.json.return = false;
					data.util.getShop(req, res, data);
				}
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
		data.util.getMemberId(req, res, data);
	}
	else if (data.action == 'register') { // เพิ่มข้อมูล
		exports.register(req, res, data);
	}
	else if (data.action == 'update') { // แก้ไขข้อมูล
	}
	else if (data.action == 'exist'){
		if (data.subAction[0] == 'username') {
			exports.checkUsername(req, res, data);
		}
		else if (data.subAction[0] == 'email') {
			exports.checkEmail(req, res, data);
		}
		else if (data.subAction[0] == 'mobile') {
			exports.checkMobile(req, res, data);
		}
		else if (data.subAction[0] == 'memberKey') {
			exports.checkMemberKey(req, res, data);
		}
	}
	else if (data.action == 'login') { // เข้าระบบ
		exports.checkLoginUsername(req, res, data);
	}
	else if (data.action == 'logout') { // ออกจากระบบ
		exports.logout(req, res, data);
	}
	else if (data.action == 'role') { 
		if(data.subAction[0] == 'info'){
			data.util.getMemberId(req, res, data);
		}
	}
	else if (data.action == 'memberprice') { 
		exports.memberPrice(req, res, data);
	}
	else if (data.action == 'mapping') { 
		exports.memberMapping(req, res, data);
	}
					
};

exports.actionAfterGetMemberId = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
		if(data.subAction[0] == 'update'){
			exports.updateMemberInfo(req, res, data);
		}else{
			data.util.getMemberInfo(req, res, data);
		}
	}
	else if(data.action == 'role'){
		if(data.subAction[0] == 'info'){
			exports.getMemberRole(req, res, data);
		}
	}
};

exports.actionAfterGetMemberInfo = function(req, res, data) {
	if (data.action == 'info') { // ข้อมูลทั่วไป
		delete data.memberInfo.RowKey;
		data.json.return = true;
		data.json.success = true;
		data.json.memberInfo = data.memberInfo;
		data.util.responseJson(req, res, data.json);
	}
	
};


exports.register = function(req, res, data) {
	data.table.createTableIfNotExists(data.tableName, function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){ // ถ้าสร้าง Table เสร็จแล้ว
			var json = null;
			
			try {
				data.jsonPost = JSON.parse(req.body.value);
				data.table.retrieveEntity(data.tableName, data.shop, 'MaxID', function(error, result, response){
					if(!error) { // มีค่า MaxID แล้ว
						data.maxID = result.Name._ +1;
						if (req.body.type == 'Facebook') {
							exports.registerFacebook(req, res, data);
						}
						else if (req.body.type == 'Web') {
							exports.registerWeb(req, res, data);
						}
						else {
							data.json.return = true;
							data.json.error = 'MBR0004';
							data.json.errorMessage = 'Type ' + req.body.type + ' รอไปก่อนนะ ยังไม่เสร็จ';
							data.util.responseJson(req, res, data.json);
						}
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
			catch(err){ // Check ว่าข้อมูล Json ถูก
				data.json.return = true;
				data.json.success = false;
				data.json.error = 'MBR0002';
				data.json.errorMessage = 'Can\'t parse data to JSON object';
				data.util.responseJson(req, res, data.json);
			}
		}
		else { // End Create Table
			data.util.responseError(req, res, error);			
		}
	});
};


exports.registerFacebook = function(req, res, data) {
	var keys = Object.keys( data.jsonPost );
	var task = { PartitionKey: {'_': req.body.type}, RowKey: {'_': data.jsonPost.id} };

	data.loginId = data.jsonPost.id;
	delete data.jsonPost.id;
	delete data.jsonPost.link;
	delete data.jsonPost.name;

	var d = new Date();
	var m = (d.getMonth()+1).toString();
	data.memberId = d.getFullYear().toString().substr(2)+(m[1]? m : '0'+m)+data.util.paddingNumber(parseInt(data.maxID), 5);
	data.task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId}, Facebook: {'_': data.loginId} };

	for( var i = 0; i < keys.length; i++ ) {
		var entity = keys[i].replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); }).replace(/^./, function(str){ return str.toUpperCase(); });
		entity = (entity == 'FirstName') ? 'Firstname' : entity;
		entity = (entity == 'LastName') ? 'Lastname' : entity;
		task[entity] = {'_': ((typeof data.jsonPost[keys[i]] =='object') ? 
			JSON.stringify(data.jsonPost[keys[i]]) : 
			((keys[i] == 'birthday' || keys[i] == 'updated_time') ? new Date(data.jsonPost[keys[i]]) : data.jsonPost[keys[i]])
			)
		};
		if (keys[i] == 'birthday' || keys[i] == 'email' || keys[i] == 'first_name' || keys[i] == 'last_name' || keys[i] == 'gender' || keys[i] == 'timezone' || keys[i] == 'locale') {
			data.task[entity] = keys[i] == 'gender' ? {'_': task[entity]._ == 'male' ? 'M' : 'F'} : task[entity];
		}
		if (keys[i] == 'location') {
			data.task.Location = {'_': data.jsonPost[keys[i]].name};
		}
		data.task.RegisterDate = {'_': new Date()};
		data.task.RegisterType = {'_': req.body.type};
		data.task.LoginCount = {'_': 0};
		data.task.Comment = {'_': 'Register from Facebook'};
		data.task.SelectedMember = {'_': data.memberId};
		data.task.SelectedMemberType = {'_': 'Member'};
		data.task.SelectedShop = {'_': data.shop};
		data.task.MemberPrice = {'_': 0};
	}

	exports.getMemberRegisterInfo(req, res, data);

	var batch = new data.azure.TableBatch();
	batch.insertOrMergeEntity(task, {echoContent: true});
	data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
};


exports.registerWeb = function(req, res, data) {
	if ( typeof data.jsonPost.Username == 'undefined' || data.jsonPost.Username == '' ) {
		data.json.return = true;
		data.json.error = 'MBR0003';
		data.json.errorMessage = 'Please input entity Username';
		data.util.responseJson(req, res, data.json);
	}
	else if ( typeof data.jsonPost.Password == 'undefined' || data.jsonPost.Password == '' ) {
		data.json.return = true;
		data.json.error = 'MBR0004';
		data.json.errorMessage = 'Please input entity Password';
		data.util.responseJson(req, res, data.json);
	}
	else {
		data.table.createTableIfNotExists('Username', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
			if(!error){
				data.table.retrieveEntity('Username', data.shop, data.jsonPost.Username.toLowerCase(), function(error, result, response){
					if (!error)
					{
						data.json.return = true;
						data.json.error = 'MBR0005';
						data.json.errorMessage = 'Username already exists';
						data.util.responseJson(req, res, data.json);
					}
					else {
						var d = new Date();
						var m = (d.getMonth()+1).toString();
						data.memberId = d.getFullYear().toString().substr(2)+(m[1]? m : '0'+m)+data.util.paddingNumber(parseInt(data.maxID), 5);
						var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId} };

						var arrayRegisterList = '|Firstname|Lastname|Email|Mobile|Username|Password|Nickname|'; // ชื่อ Entity ทั้งหมดที่เพิ่มค่าได้
						var keys = Object.keys( data.jsonPost );
						var isError = false;
						for( var i = 0; i < keys.length; i++ ) {
							if ( arrayRegisterList.indexOf( '|'+ keys[i] +'|' ) == -1 ) {
								isError = true;
								data.json.return = true;
								data.json.error = 'MBR0006';
								data.json.errorMessage = 'Unknown entity ' + keys[i];
								data.util.responseJson(req, res, data.json);
								break;
							}
							else {
								task[keys[i]] = {'_': data.jsonPost[keys[i]]};
							}
						}

						if (!isError) {

							task.RegisterDate = {'_': new Date()};
							task.RegisterType = {'_': req.body.type};
							task.LoginCount = {'_': 0};
							task.Comment = {'_': 'Register from Web'};
							task.SelectedMember = {'_': data.memberId};
							task.SelectedMemberType = {'_': 'Member'};
							task.SelectedShop = {'_': data.shop};
							task.MemberPrice = {'_': 0};
							task.Timezone = {'_': 7};
							task.Locale = {'_': 'th_TH'};
							delete task.Password;

							var batch = new data.azure.TableBatch();
							batch.insertEntity(task, {echoContent: true});
							data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
								data.loginId = data.memberId;
								exports.getMemberRegisterInfo(req, res, data);

								//## - - - - BEGIN เพิ่มค่า MaxID - - - - ##//
								task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': data.maxID} };
								batch = new data.azure.TableBatch();
								batch.updateEntity(task, {echoContent: true});
								data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
								//## - - - - END เพิ่มค่า MaxID - - - - ##//

								if ( typeof data.jsonPost.Username != 'undefined' && data.jsonPost.Username != '' ) {
									//## - - - - BEGIN เพิ่มข้อมูล Username - - - - ##//
									task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.jsonPost.Username.toLowerCase()}, Display: {'_': data.jsonPost.Username}, Member: {'_': data.memberId}, Password: {'_': data.util.encrypt(data.jsonPost.Password, data.jsonPost.Username.toLowerCase())} };
									batch = new data.azure.TableBatch();
									batch.insertOrMergeEntity(task, {echoContent: true});
									data.table.executeBatch("Username", batch, function (error, result, response) { });
									//## - - - - END เพิ่มข้อมูล Username - - - - ##//
								}

								if ( typeof data.jsonPost.Email != 'undefined' && data.jsonPost.Email != '' ) {
									//## - - - - BEGIN เพิ่มข้อมูล Email - - - - ##//
									task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.jsonPost.Email.toLowerCase()}, Member: {'_': data.memberId}, Password: {'_': data.util.encrypt(data.jsonPost.Password, data.jsonPost.Email.toLowerCase())} };
									batch = new data.azure.TableBatch();
									batch.insertOrMergeEntity(task, {echoContent: true});
									data.table.executeBatch("Email", batch, function (error, result, response) { });
									//## - - - - END เพิ่มข้อมูล Email - - - - ##//
								}

								if ( typeof data.jsonPost.Mobile != 'undefined' && data.jsonPost.Mobile != '' ) {
									//## - - - - BEGIN เพิ่มข้อมูล Mobile - - - - ##//
									task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.jsonPost.Mobile.toLowerCase()}, Member: {'_': data.memberId}, Password: {'_': data.util.encrypt(data.jsonPost.Password, data.jsonPost.Mobile.toLowerCase())} };
									batch = new data.azure.TableBatch();
									batch.insertOrMergeEntity(task, {echoContent: true});
									data.table.executeBatch("Mobile", batch, function (error, result, response) { });
									//## - - - - END เพิ่มข้อมูล Mobile - - - - ##//
								}


							}});
						}

					}
				});
			}
			else {
				data.util.responseError(req, res, error);
			}
		});		
	}
};


exports.getMemberRegisterInfo = function(req, res, data) {
	var query = new data.azure.TableQuery().select(['RowKey', 'Firstname', 'Lastname', 'Nickname', 'LoginCount', 'Username'])
		.where('PartitionKey eq ?', data.shop).and(((req.body.type == 'Web' || req.body.type == 'Desktop') ? 'RowKey' : req.body.type)+' eq ?', data.loginId);
	data.table.queryEntities(data.tableName,query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล
				data.arrayRejectList = '|RowKey|LoginCount|';
				var obj = data.util.renderData(result.entries[0], data);
				data.json.memberInfo = obj;
				data.memberId = result.entries[0].RowKey._;
				exports.addLoginKey(req, res, data);

				//## - - - - BEGIN เพิ่มค่า Login - - - - ##//
				var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId}, LoginDate: {'_': new Date()}, LoginCount: {'_': result.entries[0].LoginCount._+1} };
				batch = new data.azure.TableBatch();
				batch.mergeEntity(task, {echoContent: true});
				data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
				//## - - - - END เพิ่มค่า Login - - - - ##//
			}
			else {				
				var batch = new data.azure.TableBatch();
				batch.insertOrMergeEntity(data.task, {echoContent: true});
				data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
					exports.getMemberRegisterInfo(req, res, data);
					//## - - - - BEGIN เพิ่มค่า MaxID - - - - ##//
					var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': 'MaxID'}, Name: {'_': data.maxID} };
					batch = new data.azure.TableBatch();
					batch.updateEntity(task, {echoContent: true});
					data.table.executeBatch(data.tableName, batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); });
					//## - - - - END เพิ่มค่า MaxID - - - - ##//
				}});
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};


exports.addLoginKey = function(req, res, data) {
	data.table.createTableIfNotExists('Login', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){
			data.json.memberKey = data.util.generateId();
			var expire = new Date();
			expire.setDate(expire.getDate() + 30);

			var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.json.memberKey}, Member: {'_': data.memberId} };
			task['UpdateDate'] = {'_': new Date()};
			task['ExpiryDate'] = {'_': expire};
			
			var batch = new data.azure.TableBatch();
			batch.insertOrMergeEntity(task, {echoContent: true});
			data.table.executeBatch('Login', batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
				data.json.return = true;
				data.json.success = true;
				data.util.responseJson(req, res, data.json);
			}});
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.checkUsername = function(req, res, data) {
	data.table.createTableIfNotExists('Username', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){
			data.table.retrieveEntity('Username', data.shop, req.body.username.toLowerCase(), function(error, result, response){
				data.json.return = true;
				data.json.success = true;
				data.json.exist = !error;
				data.util.responseJson(req, res, data.json);
			});
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.checkEmail = function(req, res, data) {
	data.table.createTableIfNotExists('Email', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){
			data.table.retrieveEntity('Email', data.shop, req.body.email.toLowerCase(), function(error, result, response){
				data.json.return = true;
				data.json.success = true;
				data.json.exist = !error;
				data.util.responseJson(req, res, data.json);
			});
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.checkMobile = function(req, res, data) {
	data.table.createTableIfNotExists('Mobile', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){
			data.table.retrieveEntity('Mobile', data.shop, req.body.mobile.toLowerCase(), function(error, result, response){
				data.json.return = true;
				data.json.success = true;
				data.json.exist = !error;
				data.util.responseJson(req, res, data.json);
			});
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};

exports.checkMemberKey = function(req, res, data) {
	data.table.createTableIfNotExists('Login', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){
			data.table.retrieveEntity('Login', data.shop, req.body.memberKey, function(error, result, response){
				data.json.return = true;
				data.json.success = true;
				data.json.exist = !error;
				data.util.responseJson(req, res, data.json);
			});
		}
		else {
			data.util.responseError(req, res, error);
		}
	});
};


exports.checkLoginUsername = function(req, res, data) {
	data.table.retrieveEntity('Username', data.shop, req.body.username.toLowerCase(), function(error, result, response){
		if (!error) { // เจอ Username นี้
			if ( result.Password._ == data.util.encrypt(req.body.password, req.body.username.toLowerCase()) ) {
				req.body.type = 'Web';
				data.loginId = result.Member._;
				exports.getMemberRegisterInfo(req, res, data);
			}
			else {
				exports.checkLoginEmail(req, res, data);
			}
		}
		else {
			exports.checkLoginEmail(req, res, data);
		}
	});
};

exports.checkLoginEmail = function(req, res, data) {
	data.table.retrieveEntity('Email', data.shop, req.body.username.toLowerCase(), function(error, result, response){
		if (!error) { // เจอ Email นี้
			if ( result.Password._ == data.util.encrypt(req.body.password, req.body.username.toLowerCase()) ) {
				req.body.type = 'Web';
				data.loginId = result.Member._;
				exports.getMemberRegisterInfo(req, res, data);
			}
			else {
				exports.checkLoginMobile(req, res, data);
			}
		}
		else {
			exports.checkLoginMobile(req, res, data);
		}
	});
};

exports.checkLoginMobile = function(req, res, data) {
	data.table.retrieveEntity('Mobile', data.shop, req.body.username.toLowerCase(), function(error, result, response){
		if (!error) { // เจอ Mobile นี้
			if ( result.Password._ == data.util.encrypt(req.body.password, req.body.username.toLowerCase()) ) {
				req.body.type = 'Web';
				data.loginId = result.Member._;
				exports.getMemberRegisterInfo(req, res, data);
			}
			else {
				data.json.return = true;
				data.json.error = 'MBR0007';
				data.json.errorMessage = 'Invalid username or password';
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.json.return = true;
			data.json.error = 'MBR0007';
			data.json.errorMessage = 'Invalid username or password';
			data.util.responseJson(req, res, data.json);
		}
	});
};

exports.logout = function(req, res, data) {
	data.table.retrieveEntity('Login', data.shop, req.body.memberKey, function(error, result, response){
		if(!error){
			//## - - - - BEGIN ลบข้อมูล - - - - ##//
			var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': req.body.memberKey} };
			var batch = new data.azure.TableBatch();
			batch.deleteEntity(task, {echoContent: true});
			data.table.executeBatch('Login', batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
				data.json.return = true;
				data.json.success = true;
				data.util.responseJson(req, res, data.json);
			}});
			//## - - - - END ลบข้อมูล - - - - ##//
		}
		else { // ถ้าไม่มีข้อมลในระบ
			data.json.return = true;
			data.json.error = 'MBR0008';
			data.json.errorMessage = 'Member Key ' + req.body.memberKey + ' not found';
			data.util.responseJson(req, res, data.json);
		}			
	});
};

exports.getMemberTypeInfo = function(req, res, data) {
	var query;
	if(typeof req.body.id != 'undefined' && req.body.id != ''){
		query = new data.azure.TableQuery().where('PartitionKey eq ?', req.body.id) 
	}else {
		query = new data.azure.TableQuery().where('PartitionKey ne ?', 'MAX_VALUE');
	}
	data.table.queryEntities('MemberType',query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = data.util.renderData(result.entries[i], data);
					obj.ID = result.entries[i].PartitionKey._;
					obj.Level = result.entries[i].RowKey._;
					delete obj.RowKey;
					delete obj.PartitionKey;
					array.push(obj);
				}
				data.json.return = true;
				data.json.success = true;
				data.json.result = array;
				data.util.responseJson(req, res, data.json);
			}
			else {				
				data.json.return = true;
				data.json.success = false;
				delete data.json.error;
				delete data.json.errorMessage;
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});

};
exports.addMemberType = function(req, res, data) {
	data.table.createTableIfNotExists('MemberType', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){ // ถ้าสร้าง Table เสร็จแล้ว
			var task = {};				
			task.PartitionKey = {'_': req.body.id.capitalizeCase()};
			task.RowKey = {'_': req.body.level};
			task.AddDate = {'_': new Date()};
			task.AddBy = {'_': req.headers['x-forwarded-for'] || req.connection.remoteAddress};
			task.UpdateDate = {'_': new Date()};
			task.UpdateBy = {'_': req.headers['x-forwarded-for'] || req.connection.remoteAddress};
			
			var query = new data.azure.TableQuery().where('PartitionKey eq ?', req.body.id.capitalizeCase())
			data.table.queryEntities('MemberType',query, null, function(error, result, response) {
				if(!error){
					if ( result.entries.length != 0 ) {
						data.json.return = true;
						data.json.error = 'Member Type Exist';
						data.json.errorMessage = 'Error: ID '+req.body.id.capitalizeCase()+' Exist';
						data.util.responseJson(req, res, data.json);
					}else{
						var batch = new data.azure.TableBatch();
						batch.insertEntity(task, {echoContent: true});
						data.table.executeBatch('MemberType', batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
							data.json.return = true;
							data.json.success = true;
							data.util.responseJson(req, res, data.json);
						}});		
					}
				}
			});
							
		}else { // End Create Table
			data.util.responseError(req, res, error);			
		}
	});
};
exports.memberPrice = function(req, res, data) {
	data.table.createTableIfNotExists('MemberPrice', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){ // ถ้าสร้าง Table เสร็จแล้ว
			var query = new data.azure.TableQuery().top(1).where('PartitionKey eq ?', req.body.memberType.capitalizeCase());
			data.table.queryEntities('MemberType',query, null, function(error, result, response) {
				if(!error){
					if ( result.entries.length != 0 ) { // ถ้ามีข้อมลในระบบแล้ว
						var task = {};				
						task.PartitionKey = {'_': data.shop};
						task.RowKey = {'_': req.body.memberType.capitalizeCase()};
						task.SellPrice = {'_': isNaN(Number(req.body.sellPrice)) || typeof req.body.sellPrice == 'undefined' || req.body.sellPrice == '' ? 0 : parseInt(req.body.sellPrice)};
						task.SellStep = {'_': isNaN(Number(req.body.sellStep)) || typeof req.body.sellStep == 'undefined' || req.body.sellStep == '' ? 0 : parseInt(req.body.sellStep)};
						task.SellMaxStep = {'_': isNaN(Number(req.body.SellMaxStep)) || typeof req.body.SellMaxStep == 'undefined' || req.body.SellMaxStep == '' ? 0 : parseInt(req.body.SellMaxStep)};
						task.Qty1 = {'_': isNaN(Number(req.body.qty1)) || typeof req.body.qty1 == 'undefined' || req.body.qty1 == '' ? 0 : parseInt(req.body.qty1)};
						task.Qty2 = {'_': isNaN(Number(req.body.qty2)) || typeof req.body.qty2 == 'undefined' || req.body.qty2 == '' ? 0 : parseInt(req.body.qty2)};
						task.Qty3 = {'_': isNaN(Number(req.body.qty3)) || typeof req.body.qty3 == 'undefined' || req.body.qty3 == '' ? 0 : parseInt(req.body.qty3)};
						task.Qty4 = {'_': isNaN(Number(req.body.qty4)) || typeof req.body.qty4 == 'undefined' || req.body.qty4 == '' ? 0 : parseInt(req.body.qty4)};
						task.Qty5 = {'_': isNaN(Number(req.body.qty5)) || typeof req.body.qty5 == 'undefined' || req.body.qty5 == '' ? 0 : parseInt(req.body.qty5)};
						task.Price1 = {'_': req.body.price1};
						task.Price2 = {'_': req.body.price2};
						task.Price3 = {'_': req.body.price3};
						task.Price4 = {'_': req.body.price4};
						task.Price5 = {'_': req.body.price5};
						task.AddDate = {'_': new Date()};
						task.AddBy = {'_': req.headers['x-forwarded-for'] || req.connection.remoteAddress};
						task.UpdateDate = {'_': new Date()};
						task.UpdateBy = {'_': req.headers['x-forwarded-for'] || req.connection.remoteAddress};
						
						var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.shop).and('RowKey eq ?', req.body.memberType.capitalizeCase());
						data.table.queryEntities('MemberPrice',query, null, function(error, result, response) {
							if(!error){
								if ( result.entries.length != 0 ) {
									data.json.return = true;
									data.json.error = 'Member Type Exist';
									data.json.errorMessage = 'Error: ID '+req.body.memberType.capitalizeCase()+' Exist';
									data.util.responseJson(req, res, data.json);
								}else{
									var batch = new data.azure.TableBatch();
									batch.insertEntity(task, {echoContent: true});
									data.table.executeBatch('MemberPrice', batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
										data.json.return = true;
										data.json.success = true;
										data.util.responseJson(req, res, data.json);
									}});		
								}
							}
						});
					}else{
						data.json.return = true;
						data.json.error = 'Member Type Not Exist';
						data.json.errorMessage = 'Error: Member Type '+req.body.memberType.capitalizeCase()+' Not Exist';
						data.util.responseJson(req, res, data.json);
					}
				}
			});				
		}else { // End Create Table
			data.util.responseError(req, res, error);			
		}
	});
};
exports.memberMapping = function(req, res, data) {
	data.table.createTableIfNotExists('MemberMapping', function(error, result, response){ // ถ้ายังไม่มี Table นี้ ให้สร้าง
		if(!error){ // ถ้าสร้าง Table เสร็จแล้ว
			var task = {};
			var query = new data.azure.TableQuery().where('PartitionKey eq ?', req.body.memberType.capitalizeCase())
			data.table.queryEntities('MemberType',query, null, function(error, result, response) { //ตรวจสอบ ว่ามี MemberType นี้ไหม
				if(!error){
					if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล
						var query = new data.azure.TableQuery().where('PartitionKey eq ?', req.body.memberId).and('RowKey eq ?', req.body.memberType.capitalizeCase())
						data.table.queryEntities('MemberMapping',query, null, function(error, result, response) { //ตรวจสอบว่า Map ข้อมูลนี้หรือยัง
							if(!error){
								if ( result.entries.length != 0 ) {
									data.json.return = true;
									data.json.error = 'Member Type Exist';
									data.json.errorMessage = 'Error: Member ID '+req.body.memberId+' has '+req.body.memberType.capitalizeCase();
									data.util.responseJson(req, res, data.json);
								}else{
									var query = new data.azure.TableQuery().where('PartitionKey eq ?', data.shop).and('RowKey eq ?', req.body.memberType.capitalizeCase())
									data.table.queryEntities('MemberPrice',query, null, function(error, result, response) { //ตรวจสอบว่า Map ข้อมูลนี้หรือยัง
										if(!error){
											if ( result.entries.length != 0 ) {
												task.PartitionKey = {'_': req.body.memberId};
												task.RowKey = {'_': req.body.memberType.capitalizeCase()};
												var sellPrice;
												if(typeof req.body.sellPrice == 'undefined' || req.body.sellPrice == ''){
													sellPrice = result.entries[0].SellPrice._;
												}else{
													sellPrice = req.body.sellPrice
												}
												task.SellPrice = {'_': sellPrice};
												task.AddDate = {'_': new Date()};
												task.AddBy = {'_': req.headers['x-forwarded-for'] || req.connection.remoteAddress};
												task.UpdateDate = {'_': new Date()};
												task.UpdateBy = {'_': req.headers['x-forwarded-for'] || req.connection.remoteAddress};		
												var batch = new data.azure.TableBatch();
												batch.insertEntity(task, {echoContent: true});
												data.table.executeBatch('MemberMapping', batch, function (error, result, response) {  if(error) data.util.responseError(req, res, error); else {
													data.json.return = true;
													data.json.success = true;
													data.util.responseJson(req, res, data.json);
												}});
											}else{
												data.json.return = true;
												data.json.error = 'Member Type not mapping price';
												data.json.errorMessage = 'Error: Member Type '+req.body.memberType.capitalizeCase()+' not mapping price';
												data.util.responseJson(req, res, data.json);
											}
										}
									});										
								}
							}
						});
					}else{
						data.json.return = true;
						data.json.error = 'Member Type Not Exist';
						data.json.errorMessage = 'Error: Member Type '+req.body.memberType+' Not Exist';
						data.util.responseJson(req, res, data.json);
					}
				}
			});
							
		}else { // End Create Table
			data.util.responseError(req, res, error);			
		}
	});
};

exports.getMemberRole = function(req, res, data) {
	var query = new data.azure.TableQuery().select(['RowKey']).where('PartitionKey eq ?', data.memberId) 
	data.table.queryEntities('MemberMapping',query, null, function(error, result, response) {
		if(!error){
			if ( result.entries.length != 0 ) { // ถ้ามีข้อมูล	
				var array = [];	
				for ( var i=0; i < result.entries.length; i++){
					var obj = {};
					obj.Role = result.entries[i].RowKey._;
					array.push(obj);
				}
				data.json.return = true;
				data.json.success = true;
				data.json.result = array;
				data.util.responseJson(req, res, data.json);
			}
			else {				
				data.json.return = true;
				data.json.success = false;
				delete data.json.error;
				delete data.json.errorMessage;
				data.util.responseJson(req, res, data.json);
			}
		}
		else {
			data.util.responseError(req, res, error);
		}
	});

};

exports.updateMemberInfo = function(req, res, data){
	var arrayEntityList = '|Firstname|Lastname|Gender|SelectedMemberType|';
	data.table.retrieveEntity(data.tableName, data.shop, data.memberId, function(error, result, response){
		if(!error){ // ถ้ามีข้อมลในระบบแล้ว

			var checker = data.util.renderEntity(req.body.entity, arrayEntityList);
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
					var task = { PartitionKey: {'_': data.shop}, RowKey: {'_': data.memberId} };
					for(i=0; i<sp.length; i++){
						task[checker.entityList[i]] = {'_': typeof sp[i] == 'undefined' || sp[i] == '' ? '' : (checker.entityList[i] == 'SelectedMemberType') ? sp[i].trim().capitalizeCase() : sp[i].trim()};
						
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
			data.json.errorMessage = 'Member Key ' + req.body.value + ' not found';
			data.util.responseJson(req, res, data.json);
		}			
	});
}
//## Utilities Method ##//
String.prototype.capitalizeCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};