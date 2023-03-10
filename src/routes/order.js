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
	const reduceStock = (error) =>{
		if (error) {
			console.error(error);
			sendError();
			return;
		}
		const sql = 'SELECT `Products`.`Product_id`, `Products`.`stock`, `Basket_Items`.`amount`, `Basket_Items`.`Users_User_id` FROM `Basket_Items` INNER JOIN `Products` WHERE `Products`.`Product_id` = `Basket_Items`.Products_Product_id AND `Basket_Items`.`Users_User_id` = ?'
		conn.query(sql,[req.user.user])
		.on('result', (r) =>{
			console.log(r.amount  >= r.stock)
			if( r.amount  > r.stock ){
				res.send({
					success: false,
				});
				sendError();
				return
			}else{
				console.log([(r.stock - r.amount), r.Product_id])
				conn.query('UPDATE `Products` SET `Products`.`stock` = ? WHERE `Products`.`Product_id` = ?', [r.stock-r.amount, r.Product_id])
				.on('result', (r) =>{})
				.on('error',(e) => {});
			}
		})
		.on('end', onCommit);
	}

	const onBasketItemsDeleted = (error, result) => {
		if (error || result.affectedRows === 0) {
			conn.rollback(() => {
				sendError();
			});
			return;
		}

		conn.commit(reduceStock);
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

	const transaction = (error) => {
		if (error) {
			console.error(error);
			sendError();
			return;
		}


		conn.query('SELECT * FROM Basket_Items WHERE Users_User_id = ?', [req.user.user], onBasket);

	};

	const connect = (connErr, c) => {
		conn = c;
		sendError = () => {
			conn.release();
			res.send({
				success: false,
			});
		};
		if (connErr) {
			sendError();
			return;
		}
		conn.beginTransaction(transaction);
	};



	pool.getConnection(connect);
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
