exports.generate = function(req, res, url) {

	var stream = require('stream')
	var gm = require('gm');

	gm('/var/www/powerdd/src/img/1.jpg')
	.resize(100, 100)
	.autoOrient()
	.write(writeStream, function (err) {
	  if (!err) console.log(' hooray! ');
	});
	//res.send( url[1] );

};