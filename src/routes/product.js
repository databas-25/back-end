/* eslint-disable no-trailing-spaces */

const express = require('express');
const pool = require('../setup');

const router = express.Router();

router.post('/create', (req, res) => {
	const sql = 'INSERT INTO Products '
		+ '(Product_id, product_name, manufacturer, img_address, price, description, category, radius, rpm ) '
		+ 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
	const {
		Product_id: productId,
		product_name: productName,
		manufacturer,
		img_address: imgAddress,
		price,
		description,
		category,
		radius,
		rpm,
	} = req.body;
	pool.query(sql, [productId, productName, manufacturer, imgAddress, price, description, category, radius, rpm])
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
	// req.mysql.query("INSERT INTO Basket_Items (Users_User_id, Products_Product_id, Amount)
	// VALUES (?,?,?) ON DUPLICATE KEY UPDATE Amount = Amount + 1", [req.body.userID, req.body.productID, 1]);
});

router.post('/get_one', (req, res) => {
	pool.query('SELECT * FROM Products WHERE Product_id = ?', [req.body.productID])
		.on('result', (r) => {
			res.send({ success: true, product: r });
		})
		.on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

router.post('/fetch_items_admin', (req, res) => {
	const items = [];
	pool.query('SELECT * FROM Products', [])
		.on('result', (row) => {
			items.push(row);
		})
		.on('end', () => {
			res.send({
				success: true,
				products: items,
			});
		})
		.on('error', (error) => {
			res.send({
				success: false,
				error_data: error,
			});
		});
});

router.post('/fetch_items', (req, res) => {
	pool.query('SELECT * FROM Products WHERE published=TRUE;', [], (err, result) => {
		if (err) {
			res.send({
				success: false,
				error_data: err,
			});
			return;
		}
		res.send({
			success: true,
			products: result,
		});
	});
});

router.get('/image/:product_id', (req, res) => {
	pool.query('SELECT img_address FROM Products WHERE Product_id=?;', [req.params.product_id])
		.on('result', (r) => {
			fetch(r.img_address)
				.then(async (d) => {
					res.sendFile(new File(await d.blob(), { type: d.headers.get('content-type') }));
				})
				.catch(() => {
					res.send(404);
					res.send('Not found');
				});
		})
		.on('error', () => {
			res.status(404);
			res.send('Not found');
		});
});

router.post('/publish', (req, res) => {
	pool.query('UPDATE Products SET published=TRUE WHERE Product_id=?;', [req.body.Product_id])
		.on('result', () => {
			res.status(200);
			res.send({
				success: true,
			});
		})
		.on('error', () => {
			res.status(500);
			res.send({
				success: false,
			});
		});
});

router.post('/unpublish', (req, res) => {
	pool.query('UPDATE Products SET published=FALSE WHERE Product_id=?;', [req.body.Product_id])
		.on('result', () => {
			res.status(200);
			res.send({
				success: true,
			});
		})
		.on('error', () => {
			res.status(500);
			res.send({
				success: false,
			});
		});
});

router.post('/update_product', (req, res) => {
	// we need to unpublish the old product and create a new, updated one in its stead. We also need to fix product already in basket
	let conn;

	const sendError = () => {
		conn.release();
		res.send({
			success: false,
		});
	};

	const commit = (error) => {
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

	const onUnpublishOld = (error) => {
		if (error) {
			console.log(error);
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		console.log('Unpublished old product');

		conn.commit(commit);
	};

	const onInsertedNew = (error) => {
		if (error) {
			console.log(error);
			conn.rollback(() => {
				sendError();
			});
			return;
		}
		console.log('Inserted new product');

		const sql = 'UPDATE Products SET published=FALSE WHERE Product_id=?';
		conn.query(sql, [req.body.product.Product_id], onUnpublishOld);
	};

	const transaction = (err) => {
		if (err) {
			console.error(err);
			sendError();
			return;
		}
		console.log('Begin transaction');

		// create a new product
		const sql = 'INSERT INTO Products SET ?';
		// + ' (product_name, img_address, price, description, manufacturer, radius, units_sold, color, rpm, effect, sound, category, published)'
		// + ` VALUES (${'?, '.repeat(12)}?)`;
		// const values = [
		// 	req.body.product_name,
		// 	req.body.img_address,
		// 	req.body.price,
		// 	req.body.description,
		// 	req.body.manufacturer,
		// 	req.body.radius,
		// 	req.body.units_sold,
		// 	req.body.color,
		// 	req.body.rpm,
		// 	req.body.effect,
		// 	req.body.sound,
		// 	req.body.category,
		// 	'TRUE',
		// ];
		conn.query(sql, { ...req.body.product, Product_id: null, published: 1 }, onInsertedNew);
	};

	pool.getConnection((connErr, c) => {
		conn = c;
		if (connErr) {
			console.log(connErr);
			sendError();
			return;
		}
		conn.beginTransaction(transaction);
	});

	// pool.query(sql)
	// 	.on('result', () => {
	// 		res.status(200);
	// 		res.send({
	// 			success: true,
	// 		});
	// 	})
	// 	.on('error', () => {
	// 		res.status(500);
	// 		res.send({
	// 			success: false,
	// 		});
	// 	});
});

module.exports = router;
