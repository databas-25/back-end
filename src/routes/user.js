const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
router.post('/signUp', async (req, res) => {
	const user_name = req.body.user_name;
	const email = req.body.email;
	const password_hash = await bcrypt.hash(req.body.password);

	req.mysql.query("INSERT INTO Users (user_name, email, password_hash) VALUES (?, ?, ?)", [user_name, email, password_hash]);
});

router.post('/issueNewToken', async (req, res) => {  //for logging in
	const pwdQuery = req.mysql.query("SELECT password_hash FROM Users WHERE user_name=?", [req.body.user_name]);
	if(pwdQuery) {
		if(await bcrypt.compare(req.body.password, pwdQuery)) {
			const token = jwt.sign(req.body.user_name, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"});
			res.send(token);
		}
		res.send("incorrect password");
	}
	res.send("no password found");

});

module.exports = router;
