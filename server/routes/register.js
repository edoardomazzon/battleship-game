const express = require('express');
const User = require('../models/User');// Importiamo il model (o lo Schema) User creato in user.js nella cartella models
const router = express.Router();// Creiamo un router grazie a express
var crypto = require('crypto');

// Mostrare tutti gli utenti
router.get('/', async (req, res) => {
    try{
      const allusers = await User.find(); // Se è vuoto li ritorniamo tutti
      res.json(allusers);
    }catch(err){
      res.json({message: err})
    }
});


// Creare un utente
router.post('/', async (req, res) => {
    /* Così facendo però otterremmo una stampa di "undefined": ci serve il package  body-parser, che ci permette di trasformare 
    l'input della POST in un json leggibile dalla nostra app: allora lanciamo "npm install body-parser" e allora questa 
    funzione riuscirà a stampare l'effettivo contenuto della POST */
    var u = User.newUser(req.body);
    u.role = 'regular';
    u.max_winstreak = 0;
    u.current_winstreak = 0;
    u.games_played = 0;
    u.games_won = 0;
    u.accuracy = 0;
    u.pfp = 'profilePictureURL';
    u.setPassword(req.body.password);

    try {
        const newUser = await u.save()
        res.json(newUser)
        } catch (err) {
        res.json({ message: err })
        }
});


module.exports = router;