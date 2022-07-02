//Importo express che con il costruttore Router() costruisce un router al quale passare le request
//Per ora abbiamo fatto solo delle get e delle semplici stampe di testo giusto per vedere che funzionasse tutto
const express = require('express');

const router = express.Router();

//Qui non occorre mettere /index oppure /homepage (o quello che è) perché si arrangia app.js a importasi queste route (vedi commenti in app.js)
router.get('/', (req, res) => {
    res.send('Home page')
});

//Quando in app.js facciamo     const indexRoute = require('./routes/index');        stiamo importando ciò che esportiamo in index.js
//e quindi con questo sotto diciamo cosa esportare da index.js
module.exports = router;