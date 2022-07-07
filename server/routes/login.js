const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
    res.send('Login route')
    // da ritornare un JSON che dica se credenziali corrette o meno (da fare usando doppio hash vedi register.js)
});

module.exports = router;