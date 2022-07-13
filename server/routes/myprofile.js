const express = require('express');
const router = express.Router();

const { expressjwt: jwt } = require("express-jwt");
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['RS256']
});

router.get('/', auth, function (req, res) {
    res.send('MyArea')
});


module.exports = router;
 