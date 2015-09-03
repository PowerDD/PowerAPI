exports.generate = function(req, res, url) {

	var stream = require('stream');
	var gm = require('gm');

	var writeStream = new stream.Stream();
	writeStream.writable = true;

	gm('/var/www/powerdd/src/img/1.jpg')
		.resize(500, 500)
		.append("../public/images/watermark/remax.png")
		.stream(function streamOut (error, stdout, stderr) {
			if (!error) {
				stdout.pipe(res);
			}
			else {
				res.send(error);
			}
	});

};