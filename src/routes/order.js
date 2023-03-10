const express = require('express');
const pool = require('../setup');

const router = express.Router();

router.post('/place', (req, res) => {
	let sendError = () => {};
	let conn;
	let basket;

	const onCommit = (error) => {
		if (error) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		conn.release();
		res.send({
			success: true,
		});
	};

	const onBasketItemsDeleted = (error) => {
		if (error) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		conn.commit(onCommit);
	};

	const onOrderItemsInserted = (error) => {
		if (error) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}

		conn.query('DELETE FROM Basket_Items WHERE Users_User_id = ?', [req.user.user], onBasketItemsDeleted);
	};

	const onOrderInserted = (error, result) => {
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
		conn.query(sql, [values], onOrderItemsInserted);
	};

	const onBasket = (error, results) => {
		if (error) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		basket = results;
		conn.query('INSERT INTO `Order` (Users_User_id, timestamp) VALUES (?, CURRENT_TIMESTAMP());', [req.user.user], onOrderInserted);
	};

	const onReducedStock = () => {
		conn.query('SELECT * FROM Basket_Items WHERE Users_User_id = ?', [req.user.user], onBasket);
	};

	const onGetStock = (error, result) => {
		if (error) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		Promise.all(result.map((r) => new Promise((resolve, reject) => {
			if (r.amount > r.stock) {
				res.send({
					success: false,
				});
				sendError();
				reject();
			}
			conn.query('UPDATE `Products` SET `Products`.`stock` = ? WHERE `Products`.`Product_id` = ?', [r.stock - r.amount, r.Product_id], (e, re) => {
				if (e) {
					reject(e);
					return;
				}
				resolve(re);
			});
		})))
			.then(onReducedStock)
			.catch(() => {
				conn.rollback(() => {
					sendError();
				});
			});
	};

	const transaction = (error) => {
		if (error) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		const sql = 'SELECT'
			+ ' Product_id, stock,'
			+ ' amount, Users_User_id '
			+ 'FROM `Basket_Items` '
			+ 'LEFT JOIN `Products` '
			+ 'ON Product_id = Products_Product_id '
			+ 'WHERE Users_User_id = ?';
		conn.query(sql, [req.user.user], onGetStock);
	};

	const connect = (connErr, c) => {
		conn = c;
		sendError = () => {
			try {
				conn.release();
				res.send({
					success: false,
				});
			} catch (e) { /* */ }
		};
		if (connErr) {
			sendError();
			return;
		}
		conn.beginTransaction(transaction);
	};

	pool.getConnection(connect);
});

router.post('/getAll', (req, res) => {
	const sql = 'SELECT * FROM `Order` '
		+ ' LEFT JOIN Users ON `Order`.`Users_User_id`=`Users`.`User_id` '
		+ ' WHERE `Users`.`permission`< 10';

	pool.query(sql, (error, result) => {
		if (error) {
			res.send({
				success: false,
				error_data: error,
			});
			return;
		}
		res.send({
			success: true,
			result,
		});
	});
});

router.post('/getHistory', (req, res) => {
	const sql = 'SELECT * FROM `Order` '
	+ ' LEFT JOIN Order_Item ON `Order`.`Order_id`=Order_Item.Order_Order_id '
	+ ' LEFT JOIN Products ON `Order_Item`.`Products_Product_id`=Products.Product_id'
	+ ' WHERE `Order`.Users_User_id=? ORDER BY Order_id;';
	/* const sql = 'SELECT `Order`.Order_id, `Order`.timestamp, `Order_Item`.Products_Product_id, `Order_Item`.amount '
		+ 'FROM `Order` JOIN `Order_Item` ON `Order`.Order_id=`Order_Item`.Order_Order_id '
		+ 'WHERE `Order`.Users_User_id=?;'; */
	const items = [];
	pool.query(sql, [req.user.user])
		.on('result', (r) => {
			items.push(r);
		})
		.on('end', () => {
			res.send({
				success: true,
				result: items,
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
