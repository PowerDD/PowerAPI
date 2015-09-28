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
					data.jsonPost = JSON.parse( req.body.value );
					if ( req.body.type == 'Web' ) {
						exports.registerWeb(req, res, data);
					}
					else {
						data.json.return = true;
						data.json.error = 'MBR0002';
						data.json.errorMessage = 'Waiting for develop';
						data.util.responseJson(req, res, data.json);
					}
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
exports.registerWeb = function(req, res, data) {
	if ( typeof data.jsonPost.username == 'undefined' || data.jsonPost.username == '' ) {
		data.json.return = true;
		data.json.error = 'MBR0030';
		data.json.errorMessage = 'Please input entity Username';
		data.util.responseJson(req, res, data.json);
	}
	else if ( typeof data.jsonPost.password == 'undefined' || data.jsonPost.password == '' ) {
		data.json.return = true;
		data.json.error = 'MBR0040';
		data.json.errorMessage = 'Please input entity Password';
		data.util.responseJson(req, res, data.json);
	}
	else if ( typeof data.jsonPost.mobile == 'undefined' || data.jsonPost.mobile == '' ) {
		data.json.return = true;
		data.json.error = 'MBR0050';
		data.json.errorMessage = 'Please input entity Mobile Phone Number';
		data.util.responseJson(req, res, data.json);
	}
	else if ( typeof data.jsonPost.email == 'undefined' || data.jsonPost.email == '' ) {
		data.json.return = true;
		data.json.error = 'MBR0060';
		data.json.errorMessage = 'Please input entity Email';
		data.util.responseJson(req, res, data.json);
	}
	else {	
		data.json.return = false;
		data.command = 'EXEC sp_MemberRegister \''+req.body.shop+'\', \''+data.jsonPost.username+'\', \''+data.util.encrypt(data.jsonPost.password, data.jsonPost.username.toLowerCase())+'\', \''+data.jsonPost.mobile+'\', \''+data.util.encrypt(data.jsonPost.password, data.jsonPost.mobile.toLowerCase())+'\', \''+data.jsonPost.email+'\', \''+data.util.encrypt(data.jsonPost.password, data.jsonPost.email.toLowerCase())+'\'';
		data.util.query(req, res, data);
	}
};


//## Internal Method ##//
exports.process = function(req, res, data) {
	if (data.action == 'register'){
		data.json.result = data.result[0].result;
		data.json.return = true;
		//data.json.error = 'MBR0060';
		//data.json.errorMessage = 'Please input entity Email';
		data.util.responseJson(req, res, data.json);
	}
};

//## Utilities Method ##//
String.prototype.capitalizeCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};