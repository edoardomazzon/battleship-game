const express = require('express');
const User = require('../models/User');// Importiamo il model (o lo Schema) User creato in user.js nella cartella models
const router = express.Router();// Creiamo un router grazie a express


router.get('/', (req, res) => {
    res.send('Register route')
});


router.post('/', (req, res) => {
    /* Così facendo però otterremmo una stampa di "undefined": ci serve il package  body-parser, che ci permette di trasformare 
    l'input della POST in un json leggibile dalla nostra app: allora lanciamo "npm install body-parser" e allora questa 
    funzione riuscirà a stampare l'effettivo contenuto della POST */
    console.log(req.body)
});

module.exports = router;