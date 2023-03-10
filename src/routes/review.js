const express = require('express');
const pool = require('../setup');

const router = express.Router();

router.post('/getForProduct', (req, res) => {
	pool.query('SELECT * FROM Reviews LEFT JOIN Users ON User_id=Reviews_User_id WHERE Reviews_Product_id=? ORDER BY rating DESC', [req.body.productID], (err, result) => {
		if (err) {
			res.send({
				success: false,
				error_data: err,
			});
			return;
		}
		res.send({
			success: true,
			reviews: result,
		});
	});
});

router.post('/post', (req, res) => {
	const sql = 'INSERT INTO Reviews (Reviews_User_id, Reviews_Product_id, title, rating, body, reviewTime) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP())';
	pool.query(sql, [req.user.user, req.body.productID, req.body.title, req.body.rating, req.body.body])
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
});

module.exports = router;
