const express = require('express');

const router = express.Router();

router.post('/hej', (req, res) => {
	res.send('Hello user');
});

module.exports = router;
