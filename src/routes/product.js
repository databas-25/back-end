const express = require('express');
const pool = require('../setup');

const router = express.Router();

router.post('/create', (req, res) => {
	const sql = 'INSERT INTO Products '
		+ '(Product_id, product_name, manufacturer, img_address, price, description) '
		+ 'VALUES (?, ?, ?, ?, ?, ?)';
	const {
		Product_id: productId,
		product_name: productName,
		manufacturer,
		img_address: imgAddress,
		price,
		description,
	} = req.body;
	pool.query(sql, [productId, productName, manufacturer, imgAddress, price, description])
		.on('result', (r) => {
			res.send({
				success: true,
				result: r,
			});
		})
		.on('error', (e) => {
			res.send({
				success: false,
				error_data: e,
			});
		});
	// req.mysql.query("INSERT INTO Basket_Items (Users_User_id, Products_Product_id, Amount)
	// VALUES (?,?,?) ON DUPLICATE KEY UPDATE Amount = Amount + 1", [req.body.userID, req.body.productID, 1]);
});

router.post('/get_one', (req, res) => {
	pool.query('SELECT * FROM Products WHERE Product_id = ?', [req.body.productID])
		.on('result', (r) => {
			res.send({ success: true, product: r });
		})
		.on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

router.post('/fetch_items_admin', (req, res) => {
	const items = [];
	pool.query('SELECT * FROM Products', [])
		.on('result', (row) => {
			items.push(row);
		})
		.on('end', () => {
			res.send({
				success: true,
				products: items,
			});
		})
		.on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

router.post('/fetch_items', (req, res) => {
	const items = [];
	pool.query('SELECT * FROM Products WHERE published=TRUE', [])
		.on('result', (row) => {
			items.push(row);
		})
		.on('end', () => {
			res.send({
				success: true,
				products: items,
			});
		})
		.on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

router.get('/image/:product_id', (req, res) => {
	pool.query('SELECT img_address FROM Products WHERE Product_id=?', [req.params.product_id])
		.on('result', (r) => {
			fetch(r.img_address)
				.then(async (d) => {
					res.sendFile(new File(await d.blob(), { type: d.headers.get('content-type') }));
				})
				.catch(() => {
					res.send(404);
					res.send('Not found');
				});
		})
		.on('error', (e) => {
			res.status(404);
			res.send('Not found');
		});
});

router.post('/update_amount', (req, res) => {
	pool.query('UPDATE Basket_Items SET amount=? WHERE Products_Product_id=? AND Users_User_id=?', [req.body.amount, req.body.productID, req.body.userID])
		.on('result', () => {
			res.status(200);
			res.send({
				success: true,
			});
		})
		.on('error', () => {
			res.status(500);
			res.send({
				success: false,
			});
		});
});

router.post('/publish_product', (req, res) => {
	pool.query('UPDATE Products SET published=TRUE WHERE Product_id=?', [req.body.Product_id])
		.on('result', () => {
			res.status(200);
			res.send({
				success: true,
			});
		})
		.on('error', () => {
			res.status(500);
			res.send({
				success: false,
			});
		});
});

router.post('/unpublish_product', (req, res) => {
	pool.query('UPDATE Products SET published=FALSE WHERE Product_id=?', [req.body.Product_id])
		.on('result', () => {
			res.status(200);
			res.send({
				success: true,
			});
		})
		.on('error', () => {
			res.status(500);
			res.send({
				success: false,
			});
		});
});

router.post('/update_product', (req, res) => {
	//we need to unpublish the old product and create a new, updated one in its stead. We also need to fix product already in basket
	//sql = "BEGIN; UPDATE Products SET published=FALSE WHERE Product_id=?; INSERT INTO Products (...) VALUES (...); COMMIT;";
	pool.query(/*something*/)
		.on('result', () => {
			res.status(200);
			res.send({
				success: true,
			});
		})
		.on('error', () => {
			res.status(500);
			res.send({
				success: false,
			});
		});
});

module.exports = router;
