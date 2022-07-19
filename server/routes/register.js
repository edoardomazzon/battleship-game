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
    u.friends_list = ['aa', 'bb', 'cc'];
    u.blacklisted_users = ['aa'];
    u.pending_friend_requests = ['aa'];
    u.setPassword(req.body.password);

    /*  ----------PER CONTAINS E DELETE DA UN ARRAY-----------


    if (u.friends_list.find(element => element = 'aa')){
      console.log('CONTAINS WORKS')
    }
    delete u.friends_list[0]
    if (u.friends_list.find(element => element = 'aa')){
      console.log('CONTAINS WORKS')
    }
    
    */
    try {
        const newUser = await u.save()
        res.json(newUser)
        } catch (err) {
        res.json({ message: err })
        }
});


module.exports = router;