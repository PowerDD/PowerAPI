exports.index = function(req, res, data){
	if (data.screen == 'member') {
		data.title = 'Member - ' + data.title;
		data.titleDescription += 'ข้อมูลสมาชิกทั่วไป';
	}
	else if (data.screen == 'membertype') {
		data.title = 'Member Type - ' + data.title;
		data.titleDescription += 'ข้อมูลประเภทสมาชิก';
	}
	else if (data.screen == 'dealer') {
		data.title = 'Dealer - ' + data.title;
		data.titleDescription += 'ข้อมูลดีลเลอร์';
	}
	else if (data.screen == 'teamwork') {
		data.title = 'Teamwork - ' + data.title;
		data.titleDescription += 'ข้อมูลทีมงาน';
	}
	else if (data.screen == 'product') {
		data.title = 'Product - ' + data.title;
		data.titleDescription += 'ข้อมูลสินค้า';
	}
	else if (data.screen == 'category') {
		data.title = 'Product Category - ' + data.title;
		data.titleDescription += 'ข้อมูลหมวดหมู่ของสินค้า';
	}
	else if (data.screen == 'brand') {
		data.title = 'Product Brand - ' + data.title;
		data.titleDescription += 'ข้อมูลยี่ห้อสินค้า';
	}
	else if (data.screen == 'claim') {
		data.title = 'Product Claim - ' + data.title;
		data.titleDescription += 'ข้อมูลประกันสินค้า';
	}
	else if (data.screen == 'security') {
		data.title = 'Security - ' + data.title;
		data.titleDescription += 'การเข้ารหัส ถอดรหัส';
	}
	else if (data.screen == 'webclient') {
		data.title = 'Web Client - ' + data.title;
		data.titleDescription += 'การอ่านข้อมูลจากเว็บไซต์';
	}
	else if (data.screen == 'api') {
		data.title = 'API - ' + data.title;
		data.titleDescription += 'จัดการข้อมูล API';
	}
	else if (data.screen == 'cart') {
		data.title = 'Cart - ' + data.title;
		data.titleDescription += 'จัดการข้อมูลรถเข็นสินค้า';
	}
	else if (data.screen == 'shop') {
		data.title = 'Shop - ' + data.title;
		data.titleDescription += 'จัดการข้อมูลร้านค้า';
	}
	else if (data.screen == 'shop-config') {
		data.title = 'Shop Configuration - ' + data.title;
		data.titleDescription += 'การตั้งค่าต่างๆ ของร้านค้า';
	}
	else if (data.screen == 'order') {
		data.title = 'Order - ' + data.title;
		data.titleDescription += 'คำสั่งซื้อ';
	}
	else if (data.screen == 'console') {
		data.title = 'Developer Console - ' + data.title;
		data.titleDescription += ' ';
	}
	else if (data.screen == 'repository') {
		data.title = 'Source Control - ' + data.title;
		data.titleDescription += ' ';
	}
	else if (data.screen == 'warehouse-queue') {
		data.title = 'Warehouse Queue - ' + data.title;
		data.titleDescription += 'คิวการจัดสินค้า';
	}

	res.render(data.screen, { data: data });

};