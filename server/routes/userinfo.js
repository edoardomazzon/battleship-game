const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

// When clicking on a user's username, some basic information about that user are displayed.
// In particular, this route returns the user's accuracy, winstreak and winrate
router.post('/', async(req, res) => {
    const username = req.body.username
    
    try{
        await User.findOne({username: username}).then((result) => {
            const userinfo = {
                accuracy: result.accuracy,
                current_winstreak: result.current_winstreak,
                winrate: Math.floor( 100 * result.games_won / result.games_played)
            }

            res.json(userinfo)
        })
    } catch(err){
        console.log(err)
    }
})

module.exports = router