const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../setup');

const router = express.Router();

router.post('/addToCart', (req, res) => {
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

const jwtOptions = {
	algorithm: 'HS256',
	issuer: 'Only-Fans',
	expiresIn: '1h',
};

router.post('/sign_up', async (req, res) => {
	// const userName = req.body.user_name;
	const { username, email, password } = req.body;
	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);

	pool.query('INSERT INTO Users (account_create_time, user_name, email, password_hash) VALUES (CURRENT_DATE(), ?, ?, ?)', [username, email, passwordHash])
		.on('result', (r) => {
			const data = {
				user: r.User_id,
				username: r.user_name,
				email: r.email,
			};
			const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, jwtOptions);
			res.send({
				success: true,
				message: 'account_registered',
				user: r,
				token,
			});
		})
		.on('error', (e) => {
			switch (e.code) {
			case 'ER_DUP_ENTRY':
				res.send({
					success: false,
					message: 'duplicate_keys',
					error_data: e,
				});
				break;
			default:
				res.send({
					success: false,
					message: 'unexpected_error',
					error_data: e,
				});
			}
		});
});

router.post('/sign_in', (req, res) => { // for logging in
	pool.query('SELECT * FROM Users WHERE user_name=?', [req.body.username])
		.on('result', async (r) => {
			if (await bcrypt.compare(req.body.password, r.password_hash)) {
				const data = {
					user: r.User_id,
					username: r.user_name,
					email: r.email,
				};
				const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, jwtOptions);
				res.send({
					success: true,
					message: 'login_success',
					user: r,
					token,
				});
			} else {
				res.send({
					success: false,
					message: 'wrong_password',
				});
			}
		})
		.on('error', (e) => {
			res.send({
				success: false,
				message: 'user_not_found',
				error_data: e,
			});
		});
});

router.post('/token_sign_in', (req, res) => {
	try {
		const claims = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, jwtOptions);
		pool.query('SELECT * FROM Users WHERE User_id=? AND user_name=? AND email=?', [claims.user, claims.username, claims.email])
			.on('result', (r) => {
				res.send({
					success: true,
					user: r,
				});
			})
			.on('error', () => { // If no user matches the claims
				res.send({
					success: false,
					message: 'invalid_token',
				});
			});
	} catch (e) {
		res.send({
			success: false,
			message: 'invalid_token',
		});
	}
});

router.post('/update', (req, res) => {
	try {
		pool.query(
			  'UPDATE '
			+   'Users '
			+ 'SET '
			+   'user_name = ?, '
			+   'email = ? '
			+ 'WHERE '
			+   'User_id = ? '
			, [req.body.username, req.body.email, req.body.user]);
		res.send({success: true});
	} catch (e) {
		console.error(e);
		res.send({success: false});
	}
});

module.exports = router;
