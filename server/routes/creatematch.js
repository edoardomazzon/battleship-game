const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User')
const router = express.Router();

router.post("/", async (req, res) => {
    var newmatch = new Match(req.body)
    try{
        const insert = await newmatch.save()
        res.json(newmatch)
    }catch(err){
        console.log(err)
    }

    try{
        const update1 = User.updateOne({username: newmatch.player1}, { $inc:{games_played: 1}}).then(() => {
            const update2 = User.updateOne({username: newmatch.player2}, { $inc:{games_played: 1}}).then(() => {})})
    }catch(err){
        console.log(err)
    }
    
});

module.exports = router;