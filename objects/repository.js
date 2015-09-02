exports.action = function(req, res, data) {
	try {
		if (data.action == 'update'){
			if (typeof req.body.path != 'undefined' && req.body.path != '') {
				data.json.return = false;
				exports.update(req, res, data);
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
exports.update = function(req, res, data) {
	var Client = require('svn-spawn');
	var client = new Client({ cwd: '/var/www/powerdd/'+req.body.path+'/' });

	client.update(function(error, result) {
		if(!error){
			client.getInfo(function(err, result) {
				if(!error){
					var shell = require('shelljs');
					shell.exec('pm2 reload '+req.body.path, {async:true});
					/*var child = shell.exec('pm2 reload api', {async:true});
					child.stdout.on('data', function(data) {
						shell.echo(data);});*/

					data.json.return = true;
					data.json.info = {};
					data.json.info.revision = result.$.revision;
					data.json.info.url = result.url;
					data.json.info.author = result.commit.author;
					data.json.info.date = result.commit.date;
					data.json.success = true;
					data.util.responseJson(req, res, data.json);
				}
				else {
					data.util.responseError(req, res, error);			
				}
			});
		}
		else {
			data.util.responseError(req, res, error);			
		}
	});
};