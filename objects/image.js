exports.generate = function(req, res, url) {

	//var stream = require('stream');
	var gm = require('gm');

	/*var writeStream = new stream.Stream();
	writeStream.writable = true;*/

	gm('/var/www/powerdd/src/img/1.jpg')
		.resize(500, 500)
		.draw(['image Over 250,250 0,0 /var/www/powerdd/src/img/remax.png'])
		.stream(function streamOut (error, stdout, stderr) {
			if (!error) {
				stdout.pipe(res);
			}
			else {
				res.send(error);
			}
	});

};