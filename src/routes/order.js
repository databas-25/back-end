const express = require('express');
const pool = require('../setup');

const router = express.Router();

router.post('/place', (req, res) => {
	pool.getConnection((connErr, conn) => {
		const sendError = () => {
			conn.release();
			res.send({
				success: false,
			});
		};
		if (connErr) {
			sendError();
			return;
		}
		conn.beginTransaction((err) => {
			if (err) {
				console.error(err);
				sendError();
				return;
			}

			// get the user basket
			const basket = [];
			conn.query('SELECT * FROM Basket_Items WHERE Users_User_id = ?', [req.body.userID])
				.on('result', (r) => {
					basket.push(r);
				});

			// insert order
			conn.query('INSERT INTO `Order` (Users_User_id, timestamp) VALUES (?, CURRENT_TIMESTAMP());', [req.body.userID], (error, result) => {
				if (error) {
					conn.rollback(() => {
						sendError();
					});
					return;
				}

				const orderID = result.insertId; // gets Order_id

				const values = []; // so that the whole basket can be inserted in one query
				for (let i = 0; i < basket.length; i += 1) {
					const temp = [];
					temp.push(orderID);
					temp.push(basket[i].Products_Product_id);
					temp.push(basket[i].amount);
					values.push(temp);
				}

				const sql = 'INSERT INTO Order_Item (Order_Order_id, Products_Product_id, amount) VALUES ?';
				conn.query(sql, [values], () => {
					if (error) {
						conn.rollback(() => {
							sendError();
						});
						return;
					}

					conn.query('DELETE FROM Basket_Items WHERE Users_User_id = ?', [req.body.userID], (delErr, delRes) => {
						if (delErr || delRes.affectedRows === 0) {
							conn.rollback(() => {
								sendError();
							});
							return;
						}

						conn.commit((e) => {
							if (e) {
								conn.rollback(() => {
									sendError();
								});
								return;
							}
							conn.release();
							res.send({
								success: true,
							});
						});
					});
				});
			});
		});
	});
});

router.post('/getHistory', (req, res) => {
	const sql = 'SELECT `Order`.Order_id, `Order`.timestamp, `Order_Item`.Products_Product_id, `Order_Item`.amount '
		+ 'FROM `Order` JOIN `Order_Item` ON `Order`.Order_id=`Order_Item`.Order_Order_id '
		+ 'WHERE `Order`.Users_User_id=?;';
	pool.query(sql, [req.body.userID])
		.on('result', (r) => {
			res.send({
				success: true,
				result: r,
			});
		})
		.on('error', (e) => {
			res.send({
				success: false,
				error: e,
			});
		});
});

module.exports = router;
