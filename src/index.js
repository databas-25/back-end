const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/user');

const PORT = 8000;

const app = express();
app.use(cors());
app.use(parser.json());
app.use('/user', userRouter);
// app.use(parser.urlencoded({extended: true}));

app.post('/hello', (req, res) => {
	res.send({
		success: true,
		data: 'Hello world',
	});
});

app.listen(PORT, () => {
	console.log(`Server listening at port ${PORT}`);
});
