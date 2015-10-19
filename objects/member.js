exports.action = function(req, res, data) {	
	try {
		if (data.action == 'register'){
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
		else if (data.action == 'login'){
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.username != 'undefined' && req.body.username != '' &&
				typeof req.body.password != 'undefined' && req.body.password != '') {
					data.json.return = false;
					var password = data.util.encrypt(req.body.password, req.body.username.toLowerCase());
					data.command = 'EXEC sp_MemberLogin \''+req.body.shop+'\', \''+req.body.username+'\', \''+password+'\', \''+((typeof req.body.remember == 'undefined' || req.body.remember == '') ? '0' : req.body.remember)+'\'';
					data.util.query(req, res, data);
			}
		}
		else if (data.action == 'exist'){
			if (data.subAction[0] == 'memberKeyAndBrowser'){				
				if (typeof req.body.memberKey != 'undefined' && req.body.memberKey != '' &&
					typeof req.body.ip != 'undefined' && req.body.ip != '' &&
					typeof req.body.browser != 'undefined' && req.body.browser != '' &&
					typeof req.body.version != 'undefined' && req.body.version != '' &&
					typeof req.body.platform != 'undefined' && req.body.platform != '' &&
					typeof req.body.os != 'undefined' && req.body.os != '' &&
					typeof req.body.deviceType != 'undefined' && req.body.deviceType != '') {
						data.json.return = false;
						data.command = 'EXEC sp_MemberKeyAndBrowserExist \''+req.body.memberKey+'\', \''+req.body.ip+'\', \''+req.body.browser+'\', \''+req.body.version+'\', \''+req.body.platform+'\', \''+req.body.os+'\', \''+req.body.deviceType+'\'';
						data.util.query(req, res, data);
				}
			}
		}
		else if (data.action == 'info'){				
			if (typeof req.body.shop != 'undefined' && req.body.shop != '' &&
				typeof req.body.memberKey != 'undefined' && req.body.memberKey != '') {
					data.json.return = false;
					data.command = 'EXEC sp_MemberInfo \''+req.body.shop+'\',\''+req.body.memberKey+'\'';
					data.util.query(req, res, data);
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
exports.process = function(req, res, data) {
	if (data.action == 'register'){
		exports.register(req, res, data);
	}
	else if (data.action == 'login'){
		exports.login(req, res, data);
	}
	else if (data.action == 'exist'){
		if (data.subAction[0] == 'memberKeyAndBrowser'){
			exports.memberKeyAndBrowserExist(req, res, data);
		} 
	}
	else if (data.action == 'info'){
		exports.memberInfo(req, res, data);
	}
};

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

exports.register = function(req, res, data) {
	data.json.return = true;
	if( data.result[0].result == 'username already exists' ) {
		data.json.error = 'MBR0031';
		data.json.errorMessage = 'Username already exists';
	}
	else if( data.result[0].result == 'shop does not exist' ) {
		data.json.error = 'MBR0041';
		data.json.errorMessage = 'Shop does not exist';
	}
	else if( data.result[0].result == 'mobile already exists' ) {
		data.json.error = 'MBR0051';
		data.json.errorMessage = 'Mobile phone number already exists';
	}
	else if( data.result[0].result == 'email already exists' ) {
		data.json.error = 'MBR0061';
		data.json.errorMessage = 'Email already exists';
	}
	else {
		data.json.success = true;
	}
	data.util.responseJson(req, res, data.json);
};

exports.login = function(req, res, data) {
	data.json.return = true;
	if( data.result[0].result == 'not exists' ) {
		data.json.error = 'MBR0032';
		data.json.errorMessage = 'Invalid Username or Password';
	}
	else if( data.result[0].result == 'shop does not exist' ) {
		data.json.error = 'MBR0041';
		data.json.errorMessage = 'Shop does not exist';
	}
	else {
		data.json.success = true;
		data.json.result = data.result[0].result
	}
	data.util.responseJson(req, res, data.json);
};

exports.memberKeyAndBrowserExist = function(req, res, data) {
	data.json.return = true;
	if( data.result[0].result == 'not exists' ) {
		data.json.error = 'MBR0033';
		data.json.errorMessage = 'Invalid Member Key';
	}
	else {
		data.json.success = true;
	}
	data.util.responseJson(req, res, data.json);
};

exports.memberInfo = function(req, res, data) {
	data.json.return = true;
	if( data.result[0].result == 'shop does not exist' ) {
		data.json.error = 'MBR0041';
		data.json.errorMessage = 'Shop does not exist';
	}
	else if(data.result[0].result == 'member does not exist'){
		data.json.error = 'MBR0071';
		data.json.errorMessage = 'Member does not exist';
	}
	else {
		data.json.success = true;
		data.json.result = data.result;
	}
	data.util.responseJson(req, res, data.json);
};

//## Utilities Method ##//
String.prototype.capitalizeCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};