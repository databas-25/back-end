const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../setup');
const router = express.Router();

router.get('/fetch_items', (req, res) => {
    try {
        //const claims = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, jwtOptions);
        const rows = [];
        pool.query('SELECT Products_Product_id, amount FROM Basket_Items WHERE Users_User_id = ?', [req.body.userId])
            .on('result', rows.push).on('end', (r) => {
                res.send({success: true, data: rows});
            });
    } catch(e) {
        res.send({
            success: false
        });
    }
});



module.exports = router;