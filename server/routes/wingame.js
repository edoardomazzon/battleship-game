const express = require('express');
const router = express.Router();
const User = require('../models/User');

// When a user wins a game, we increment his games_won counter as well as his current winstreak. If his current winstreak is 
// greater than his max winstreak, the current winstreak becomes the max winstreak.
router.post('/', async(req, res) => {
    const username = req.body.username
    var current_max = 0
    var current_winstreak
    const select = await User.findOne({username: username}).then((result) => {
        current_max = result.max_winstreak
        current_winstreak = result.current_winstreak + 1
    })
    try{
        const update = User.updateOne({username: username}, { $inc:{games_won: 1, current_winstreak: 1}}).then(() => {
            if(current_winstreak > current_max){
                const update2 = User.updateOne({username: username}, { $inc:{max_winstreak: 1}}).then()
            }
            res.json('Updated games_won')
        })        
    }catch(err){
        res.json(err)
        console.log(err)
    }
})

module.exports = router