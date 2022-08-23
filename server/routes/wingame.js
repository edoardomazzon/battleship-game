const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match')

// When a user wins a game, we increment his games_won counter as well as his current winstreak. If his current winstreak is 
// greater than his max winstreak, the current winstreak becomes the max winstreak.
router.post('/', async(req, res) => {
    const username = req.body.username
    var player1
    var player2

    if(req.body.username.localeCompare(req.body.enemy) < 0){
        player1 = req.body.username
        player2 = req.body.enemy
    }
    else{
        player1 = req.body.enemy
        player2 = req.body.username
    }
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
            const updatematch = Match.updateOne({player1: player1, player2: player2, timestamp: req.body.timestamp}, {winner: req.body.username}).then()
            res.json('Updated games_won')
        })
    }catch(err){
        res.json(err)
        console.log(err)
    }
})

module.exports = router