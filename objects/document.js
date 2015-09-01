var request = require('request');

exports.generate = function(req, res, data) {

	var url = req.headers['x-original-url'].split('/');
	url = url.filter(function(n){ return n !== ''; });
	data.documentType = url[1]; // ประเภทเอกสาร
	url[2] = url[2].replace('.pdf', '');
	var sp = url[2].split('-');
	data.id = sp[sp.length-1]; // รหัสเอกสาร
	data.key = sp[sp.length-2]; //key
	data.shop = url[2].replace('-'+data.key + '-'+data.id, ''); // รหัสร้านค้า

	if ( data.documentType == 'po' || data.documentType == 'pof' ){
		request.post({headers: { 'referer': 'https://' + req.get('host') }, url: 'https://' + req.get('host') + '/order/info/memberKey',
			form: 	{
				apiKey: data.apiKey,
				shop: data.shop,
				key: data.key,
				orderNo: data.id,
				type: 'A'
				}
			},
		function (error, response, body) {
			if (!error) {
				
				data.json = JSON.parse(body);
				if(data.json.success){
					exports.generatePo(req, res, data);
					//res.json(data.json)
				}
				else{
					res.send('error');
				}
			}
			else {	
				res.json(error);			
			}
		});
	}

};


exports.generatePo = function(req, res, data) {
	// var PDFDocument = require('pdfkit');
	// var doc = new PDFDocument({margin: 10, size: 'A4'});

	// doc.moveTo(0, 0)
		// .font('./public/fonts/ANGSAU.TTF', 16)
		// .text('Hello World', { align: 'right' })
	
	var PDFDocument = require('pdfkit');
	var moment = require('moment');
	var doc = new PDFDocument({margin: 10, size: 'A4'});
	
	var keys = Object.keys(data.json.detail);
	var report = '';
	if(data.documentType == 'po'){
		//doc.image('./public/images/report/order4customer.png', 0, 0, {width:600});	
		report = 'order4customer';
	}
	else{
		//doc.image('./public/images/report/order4office.png', 0, 0, {width:600});
		report = 'order4office';	
	}
	
		doc.image('./public/images/report/'+report+((keys.length > 42) ? '0' : '')+'.png', 0, 0, {width:600});
		rq = require('request');
		
		rq({
			url: 'https://power-api-test.azurewebsites.net/barcode/' + data.json.header.MemberID,
			encoding: null
		}, function(err, response, body) {
			if (err) throw err;
			doc.image(body, 432, 107, {width:140});
			
			rq({
				url: 'https://power-api-test.azurewebsites.net/barcode/' + data.id,
				encoding: null
			}, function(err, response, body) {
				if (err) throw err;
				doc.image(body, 25, 47, {width:120});
			
				var d = data.json.header.OrderDate;
				var date = moment(d);
				date.lang('th');
				date.add(3600*7, 'seconds'); // GMT +7
				
				doc.moveTo(0,0)
					doc.y = 60; doc.x = 430;		doc.font('./public/fonts/THSarabunBold.TTF', 16).text('วันที่ ' + date.format('DD MMMM')+' '+(parseInt(date.format('YYYY'))+543)+' '+date.format('HH:mm'))	
					doc.y = 89; doc.x = 515;		doc.font('./public/fonts/CALIBRIB.TTF', 12).text(data.id)
					
					//doc.y = 85; doc.x = 515;		doc.text(keys.length)
					doc.y = 29; doc.x = 67;			doc.font('./public/fonts/CALIBRI.TTF', 12).text(data.json.header.MemberID);
					doc.y = 24; doc.x = 150;		doc.font('./public/fonts/THSarabunBold.ttf', 16).text(data.json.address.Firstname + '  ' + data.json.address.Lastname)
					doc.y = 44; doc.x = 150;		doc.font('./public/fonts/THSarabunBold.ttf', 18).text(data.json.address.ShopName);
					doc.y = 70; doc.x = 67;			doc.font('./public/fonts/THSarabun.ttf', 14).text(data.json.address.Address + '  ' +data.json.address.Address2);
					var isBkk = data.json.address.Province == 'กรุงเทพมหานคร';
					doc.y = 90; doc.x = 67;			doc.text(((isBkk) ? 'แขวง' : 'ตำบล')+data.json.address.SubDistrict+' '+((isBkk) ? 'เขต' : 'อำเภอ')+data.json.address.District+' '+((isBkk) ? '' : 'จังหวัด')+data.json.address.Province+' รหัสไปรษณีย์ '+data.json.address.Zipcode);
					doc.y = 110.5; doc.x = 67;		doc.font('./public/fonts/THSarabun.ttf', 14).text(data.json.address.Mobile.substr(0,3)+'-'+data.json.address.Mobile.substr(3,3)+'-'+data.json.address.Mobile.substr(6,4));
					
					var y = 158;
					var page = 1;
					var maxY = 785;
					doc.font('./public/fonts/ANGSAU.TTF', 14);
					
					for(i=0; i < keys.length; i++){
						if ( page == 1){
							if ( y > maxY ) {
								doc.addPage();
								//doc.image('./public/images/report/'+report+'1.png', 0, 0, {width:600});
								doc.image('./public/images/report/'+report+(((keys.length - i) > 60) ? '1' : '2')+'.png', 0, 0, {width:600});
								y = 35;
								page++;
							}
						}
						else {
							if ( y > maxY ) {
								doc.addPage();
								doc.image('./public/images/report/'+report+(((keys.length - i) > 63) ? '1' : '2')+'.png', 0, 0, {width:600});
								//doc.y = 10;	doc.x = 10;	doc.text('./public/images/report/'+report+(((keys.length - i) > 63) ? '1' : '2')+'.png');
								y = 35;
								page++;
								doc.y = 10;	doc.x = 10;	doc.text(page + '/' +page);
							}
						}

						y += 12;
						var sku = data.json.detail[keys[i]].SKU;
						var detail = data.json.detail[keys[i]].Name;
						var location = data.json.detail[keys[i]].Location;
						var priceIndex = data.json.detail[keys[i]].PriceIndex;
						var price = data.json.detail[keys[i]].Price;
						var qty = data.json.detail[keys[i]].Qty;
						var totalPrice = price*qty;
						doc.y = y; doc.x = 25;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(sku);
						doc.y = y; doc.x = 85;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(detail.replace(/&#44;/g, ','));
						
						if (data.documentType == 'pof'){
							doc.y = y; doc.x = 440;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(numberWithCommas(price),{ width:33, align: 'right' });
							doc.y = y; doc.x = 353;		doc.font('./public/fonts/ANGSAU.TTF', 12).text(location,{ width:56, align: 'right' });
							doc.y = y; doc.x = 420;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(priceIndex,{ width:7, align: 'right' });
						}
						else{
							doc.y = y; doc.x = 420;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(numberWithCommas(price),{ width:40, align: 'right' });
						}
						
						doc.y = y; doc.x = 480;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(numberWithCommas(qty),{ width:27, align: 'right' });
						doc.y = y; doc.x = 540;		doc.font('./public/fonts/ANGSAU.TTF', 14).text(numberWithCommas(totalPrice),{ width:32, align: 'right' });
					}
					
					doc.font('./public/fonts/CALIBRI.TTF', 12);
					doc.y = 735; doc.x = 523;		doc.text(numberWithCommas(data.json.header.Price), { width:50, align: 'right' });
					doc.y = 752; doc.x = 523;		doc.text((data.json.header.DiscountPrice == 0) ? '-' : numberWithCommas(data.json.header.DiscountPrice), { width:50, align: 'right' });
					doc.y = 771; doc.x = 523;		doc.text((data.json.header.CouponDiscount == 0) ? '-' : numberWithCommas(data.json.header.CouponDiscount), { width:50, align: 'right' });
					doc.y = 790; doc.x = 523;		doc.text((data.json.header.ShippingPrice == 0) ? '-' : numberWithCommas(data.json.header.ShippingPrice), { width:50, align: 'right' });
					doc.y = 807; doc.x = 523;		doc.font('./public/fonts/CALIBRIB.TTF', 12).text(numberWithCommas(data.json.header.TotalPrice), { width:50, align: 'right' });
					
					doc.y = 751; doc.x = 489.5;		doc.font('./public/fonts/THSarabunBold.ttf', 12).text(data.json.header.DiscountPercent);

					if (data.documentType == 'pof') {
						doc.font('./public/fonts/THSarabun.ttf', 12);
						doc.y = 691;	doc.x = 460;	doc.text('-');//doc.text((recordset[0][0]['manager'] == null) ? '-' : recordset[0][0]['manager']);
						doc.y = 703;	doc.x = 460;	doc.text('-');//doc.text((recordset[0][0]['headSale'] == null) ? '-' : recordset[0][0]['headSale']);
						doc.y = 715;	doc.x = 460;	doc.text('-');//doc.text((recordset[0][0]['sale'] == null) ? '-' : recordset[0][0]['sale']); 
					}
										
					doc.pipe(res);
					doc.end();
					return;
			});
		});
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}