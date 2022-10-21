const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

// Called whenever a user takes a shot and gets the shot result back; here the accuracy is updated as well as the total shots count
// and the hit shots count
router.post('/', async(req, res) => {
    // console.log(req.body)
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