exports.generate = function(req, res, url) {
	
	var brand = (url[1] == '' || (url[1] != 'source' && url[1] != 'remax' && url[1] != 'powerdd')) ? 'remax' : url[1];

	if ( typeof req.headers.referer == 'undefined' ) {
		res.redirect('//src.powerdd.com/img/watermark/'+((brand == 'source') ? 'remax' : brand)+'.png');
	}
	else {
		var ref = req.headers.referer.split('/');
		if ( ref[2].indexOf('powerdd.com') == -1 && ref[2].indexOf('remaxthailand.co.th') == -1 && ref[2].indexOf('remaxthail.net') == -1 ) {
			res.redirect('//src.powerdd.com/img/watermark/'+((brand == 'source') ? 'remax' : brand)+'-text.png');
		}
		else if ( brand == 'source' ) {
			res.redirect('//src.powerdd.com/img/'+url[2]+'/'+url[3]+'/'+url[4]+'/'+ ( (url.length == 8) ? url[7] : url[5] ) );
		}
		else {
			var gm = require('gm');
			var name = (url.length == 8) ? url[7] : url[5];
			var img = gm('/var/www/powerdd/src/img/'+url[2]+'/'+url[3]+'/'+url[4]+'/'+ name );
			img.size(function(err, value){
				var box = value.width > value.height ? value.height/4 : value.width/4;
				var textWidth = box*4/3;
				var textHeight = textWidth/8;
				var count = 5;
				var boxSplit = value.height/count;
				var gabX = ((value.width/2)-textWidth)/2;
				var gabY = (boxSplit-textHeight)/2;
				if (name.toLowerCase().indexOf('.gif') == -1) {
					for(i=0; i<count; i++){
						img.draw(['image Over '+gabX+','+((boxSplit*i)+gabY)+' '+textWidth+','+(textWidth/8)+' /var/www/powerdd/src/img/watermark/'+brand+'-text.png']);
						if ( i < count-1 ) {
							img.draw(['image Over '+((value.width/2)+gabX)+','+((boxSplit*i)+gabY)+' '+textWidth+','+(textWidth/8)+' /var/www/powerdd/src/img/watermark/'+brand+'-text.png']);
							img.draw(['image Over '+((value.width-textWidth)/2)+','+((boxSplit*(i+1))-(textHeight/2))+' '+textWidth+','+(textWidth/8)+' /var/www/powerdd/src/img/watermark/'+brand+'-text.png']);
						}
					}
				}
				img.draw(['image Over '+(value.width-box)+','+(value.height-box)+' '+box+','+box+' /var/www/powerdd/src/img/watermark/'+brand+'.png'])

				if(url.length == 8) img.resize(url[5], url[6]);

				img.comment('RemaxThailand')
					.compress('Lossless')
					.stream(function streamOut (error, stdout, stderr) {
						if (!error) {
							stdout.pipe(res);
						}
						else {
							res.send(error);
						}
					});

			});
		}
	}

};