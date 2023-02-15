const express = require('express');
// const jwt = require('jsonwebtoken');
const pool = require('../setup');

const router = express.Router();

router.post('/fetch_items', (req, res) => {
	try {
		console.log(req.body);

		// const claims = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, jwtOptions);

		const sql = ' SELECT'
			+ ' Products.product_name,'
			+ ' Products.price,'
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

module.exports = router;
