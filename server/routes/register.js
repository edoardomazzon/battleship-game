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
    u.setPassword(req.body.password);

    /*
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: crypto.createHash('sha256').update(crypto.createHash('sha256').update(req.body.password).digest('hex')).digest('hex'),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        max_winstreak: 0,
        current_winstreak: 0,
        accuracy: 0,
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        pfp: 'profile picture URL'
    })
    */
    try {
        const newUser = await u.save()
        res.json(newUser)
        } catch (err) {
        res.json({ message: err })
        }
});


module.exports = router;