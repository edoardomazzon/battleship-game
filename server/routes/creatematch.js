const express = require('express');
const Match = require('../models/match.js');
const User = require('../models/user.js')
const router = express.Router();

// When a match starts, a match is inserted into the database and both players' "games_played" count increases
router.post("/", async (req, res) => {
    var newmatch = new Match(req.body)
    try{
        const insert = await newmatch.save()
        res.json(newmatch)
    }catch(err){
        console.log(err)
    }

    try{
        User.updateOne({username: newmatch.player1}, { $inc:{games_played: 1}}).then(() => {
            User.updateOne({username: newmatch.player2}, { $inc:{games_played: 1}}).then()})
    }catch(err){
        console.log(err)
    }
    
});

module.exports = router;