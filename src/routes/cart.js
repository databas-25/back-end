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
		console.log(sql);
		pool.query(sql, [req.body.userId])
			.on('result', (r) => {
				console.log(r);
				rows.push(r);
			})
			.on('end', () => {
				console.log(rows);
				res.send({ success: true, data: rows });
			});
	} catch (e) {
		res.send({
			success: false,
		});
	}
});

module.exports = router;
