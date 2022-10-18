const express = require('express');
const Match = require('../models/match.js');
const User = require('../models/user.js')
const router = express.Router();

// When a match starts, a match is inserted into the database and both players' "games_played" count increases. 
// This route also modifies the "recently played" list.
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

    // Adding user1's username into user2's recently played list and vice versa. If the list exceeds the length of 10,
    // the earliest recently played enemy is deleted from the list.
    var user1 = new User()
    var user2 = new User()
    User.findOne({username: newmatch.player1}).then((result1) => {
        user1 = result1
        User.findOne({username: newmatch.player2}).then((result2) => {
            user2 = result2
            if(!user1.recently_played.includes(user2.username)){
                user1.recently_played.push(user2.username)
            }
            if(!user2.recently_played.includes(user1.username)){
                user2.recently_played.push(user1.username)
            }
            if(user1.recently_played.length > 10){ user1.recently_played.shift() }
            if(user2.recently_played.length > 10){ user2.recently_played.shift() }    
        
            try{
                User.updateOne({username: user1.username}, { recently_played: user1.recently_played }).then(() => {
                    User.updateOne({username: user2.username}, { recently_played: user2.recently_played }).then( () => {
                    })
                })
            }catch(err){
                console.log(err)
            }
        })
    })
    
    
    
    
});

module.exports = router;