const express = require('express');
const parser = require('body-parser');
require('dotenv').config();
const pool = require('./setup');
const user_router = require('./routes/user');
const PORT = 8000;

const app = express();
app.use(parser.json());
app.use(function(req, res, next){
    req.mysql = pool;
    next();
});
app.use("/user", user_router);
// app.use(parser.urlencoded({extended: true}));

app.get("/hello", (req, res) => {
    res.send("Hello, world!");
});

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});
