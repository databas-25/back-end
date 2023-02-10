const express = require('express');
// const jwt = require('jsonwebtoken');
const pool = require('../setup');

const router = express.Router();

router.get('/fetch_items', (req, res) => {
	try {
		// const claims = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, jwtOptions);
		const rows = [];
		pool.query('SELECT Products.product_name, Products.price, Basket_Items.Products_Product_id, Basket_Items.amount FROM Basket_Items WHERE Basket_Items.Users_User_id = ? LEFT JOIN Products ON Product.Product_id = Basket_Items.Products_Product_id', [req.body.userId])
            .on('end', () => {
				res.send({ success: true, data: rows });
			});
	} catch (e) {
		res.send({
			success: false,
		});
	}
});

module.exports = router;
