const express = require('express');
const router = express.Router();

router.get("/hej", (req, res) => {

    res.send("Hello user");
});

module.exports = router;