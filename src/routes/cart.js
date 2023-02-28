const express = require('express');
// const jwt = require('jsonwebtoken');
const pool = require('../setup');

const router = express.Router();

router.post('/fetch_items', (req, res) => {
	try {
		// const claims = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, jwtOptions);

		const sql = ' SELECT'
			+ ' Products.product_name,'
			+ ' Products.price,'
			+ ' Products.img_address, '
			+ ' Basket_Items.Products_Product_id,'
			+ ' Basket_Items.amount'
			+ ' FROM'
			+ ' 	Basket_Items'
			+ ' LEFT JOIN Products ON Basket_Items.Products_Product_id = Products.Product_id'
			+ ' WHERE'
			+ ' 	Basket_Items.Users_User_id = ?;';

		const rows = [];
		pool.query(sql, [req.body.userId])
			.on('result', (r) => {
				rows.push(r);
			})
			.on('end', () => {
				res.send({ success: true, data: rows });
			});
	} catch (e) {
		res.send({
			success: false,
		});
	}
});

router.post('/add_item', (req, res) => {
	res.send({
		success: true,
	});

	const sql = 'INSERT INTO Basket_Items '
		+ '(Users_User_id, Products_Product_id, Amount) '
		+ 'VALUES '
		+ '(?, ?, ?)'
		+ 'ON DUPLICATE KEY UPDATE '
		+ 'Amount = Amount + 1';
	pool.query(sql, [req.body.userID, req.body.productID, 1]);
	// req.mysql.query("INSERT INTO Basket_Items (Users_User_id, Products_Product_id, Amount)
	// VALUES (?,?,?) ON DUPLICATE KEY UPDATE Amount = Amount + 1", [req.body.userID, req.body.productID, 1]);
});

router.post('/add_item', (req, res) => {
	res.send({
		success: true,
	});

	const sql = 'INSERT INTO Basket_Items '
		+ '(Users_User_id, Products_Product_id, Amount) '
		+ 'VALUES '
		+ '(?, ?, ?)'
		+ 'ON DUPLICATE KEY UPDATE '
		+ 'Amount = Amount + 1';
	pool.query(sql, [req.body.userID, req.body.productID, 1]);
	// req.mysql.query("INSERT INTO Basket_Items (Users_User_id, Products_Product_id, Amount)
	// VALUES (?,?,?) ON DUPLICATE KEY UPDATE Amount = Amount + 1", [req.body.userID, req.body.productID, 1]);
});

router.post('/clearUser', (req, res) => {
	pool.query('DELETE FROM Basket_Items WHERE Users_User_id = ?', [req.body.userID])
		.on('result', (r) => {
			res.send({
				success: true,
				result: r,
			});
		}).on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

router.post('/clearItem', (req, res) => {
	pool.query('DELETE FROM Basket_Items WHERE Users_User_id = ? AND Products_Product_id = ?', [req.body.userID, req.body.productID])
		.on('result', (r) => {
			res.send({
				success: true,
				result: r,
			});
		}).on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

module.exports = router;
