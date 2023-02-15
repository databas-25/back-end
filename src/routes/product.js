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

router.post('/fetch_items', (req, res) => {
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

module.exports = router;
