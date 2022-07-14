const express = require('express');
const router = express.Router();
const jwtdecode = require('jwt-decode');

const { expressjwt: jwt } = require("express-jwt");
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256']
});



router.get('/', auth, function (req, res) {
    /*
    Nell'header di questa richiesta arriva anche l'authorization fatta così: 'Bearer ****token****' .
    Vogliamo ottenere l'username decodificato dal token, e lo otteniamo grazie alla funzione jwtdecode applciata al campo
    authorization dell'header. Poi ci applichiamo la split e prendiamo la parte destra (per questo c'è il [1] e non [0] che
    sarebbe la parte sinistra, cioè 'Bearer').
    */
    var authorization_token = req.headers.authorization.split(' ')[1];
    var username = jwtdecode(authorization_token);
    /*
    ora come ora      username = { username:nome, expirationdate:****, creationdate: ***** }
    Ma noi vogliamo solo lo username quindi scriviamo username.username
    */
    current_username = username.username;
    console.log(current_username);
    res.send('MyArea')
});


module.exports = router;
 