const express = require('express');
const User = require('../models/User');// Importiamo il model (o lo Schema) User creato in user.js nella cartella models
const router = express.Router();// Creiamo un router grazie a express


router.get('/', async (req, res) => {
  res.json('Register')
});


// When a user registers, his information is saved in a new inserted db user
router.post('/', async (req, res) => {
    var u = User.newUser(req.body);
    u.role = 'regular';
    u.max_winstreak = 0;
    u.current_winstreak = 0;
    u.games_played = 0;
    u.games_won = 0;
    u.accuracy = 0;
    u.pfp = 'profilePictureURL';
    u.friends_list = [];
    u.blacklisted_users = [];
    u.pending_friend_requests = [];
    u.setPassword(req.body.password);

    try {
        const newUser = await u.save()
        res.json(newUser)
        } catch (err) {
        res.json({ message: err })
        }
});


module.exports = router;