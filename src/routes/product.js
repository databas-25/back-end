const express = require('express');
const pool = require('../setup');
const router = express.Router();

router.post('/create', (req, res) => {

	const sql = 'INSERT INTO Products '
		+ '(Users_User_id, Products_Product_id, Amount) '
		+ 'VALUES (?, ?, ?)';
	pool.query(sql, [req.body.userID, req.body.productID, 1])
        .on('result', (r) => {
            res.send({
                success: true,
                product: r,
            });
        });
	// req.mysql.query("INSERT INTO Basket_Items (Users_User_id, Products_Product_id, Amount)
	// VALUES (?,?,?) ON DUPLICATE KEY UPDATE Amount = Amount + 1", [req.body.userID, req.body.productID, 1]);
});

module.exports = router;
