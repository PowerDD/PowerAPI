exports.generate = function(req, res, message) {

	try {
		var codes = require('rescode');
		codes.loadModules(['code39'], { "includetext":false, "guardwhitespace":false, "inkspread":0, scaleX:3, textyoffset:-15 });
		var data8 = codes.create('code39', message);
		res.setHeader('Content-Type','image/png');
		res.end( data8 );
	}
	catch(err) {
		res.json(err);
	}

};