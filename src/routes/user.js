const express = require('express');

const router = express.Router();

router.post('/hej', (req, res) => {
	req.mysql.query("INSERT INTO Users (account_create_time, password_hash, salt, email) VALUES (CURRENT_DATE(), ?, ?, ?)", [5555, 55555, "bob8@bob.bob"]);
	res.send({success: true});
});

router.post('/addToCart', (req, res) => {
	res.send({
		success: true,
	});
	
	let sql = "INSERT INTO Basket_Items " +
		"(Users_User_id, Products_Product_id, Amount) " +
  		"VALUES " +
		"(?, ?, ?)" +
  		"ON DUPLICATE KEY UPDATE " + 
  		"Amount = Amount + 1";
	req.mysql.query(sql, [req.body.userID, req.body.productID, 1]);
	//req.mysql.query("INSERT INTO Basket_Items (Users_User_id, Products_Product_id, Amount) VALUES (?,?,?) ON DUPLICATE KEY UPDATE Amount = Amount + 1", [req.body.userID, req.body.productID, 1]);
})

module.exports = router;
