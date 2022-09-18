const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

// When a user loses a game, we set his current_winstreak field to 0
router.post('/', async(req, res) => {
    const username = req.body.username
    try{
        User.updateOne({username: username}, { current_winstreak: 0}).then()        
    }catch(err){
        console.log(err)
    }
})

module.exports = router