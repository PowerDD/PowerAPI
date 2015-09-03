exports.generate = function(req, res, url) {

	var stream = require('stream');
	var gm = require('gm');

	var writeStream = new stream.Stream();
	writeStream.writable = true;

	gm('/var/www/powerdd/src/img/1.jpg')
	.resize(100, 100)
	.stream(function streamOut (err, stdout, stderr) {
            if (err) return next(err);
            stdout.pipe(res); //pipe to response
            stdout.on('error', next);
	});

};