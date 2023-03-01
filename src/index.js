const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/user');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const productRouter = require('./routes/product');
const reviewRouter = require('./routes/review');

const PORT = 8000;

const app = express();
app.use(cors());
app.use(parser.json());
// app.use(parser.urlencoded({extended: true}));

app.use('/user', userRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/product', productRouter);
app.use('/review', reviewRouter);

app.post('/hello', (req, res) => {
	res.send({
		success: true,
		data: 'Hello world',
	});
});

app.listen(PORT, () => {
	console.log(`Server listening at port ${PORT}`);
});
