const express = require('express');
const User = require('../models/User');
const router = express.Router();

//Attivata quando un utente A mette in blacklist un utente B.
router.post("/", async (req, res) => {
    const blacklist_receiver = req.body.receiver
    const blacklist_sender = req.body.sender
    var new_blacklist = new Array()
    const user = await User.findOne({username: blacklist_sender})
    new_blacklist = user.blacklisted_users
    new_blacklist.push(blacklist_receiver)
    
    //Effettiamo la UPDATE sulla blacklisted_users di chi ha deciso di mettere in blacklist l'altro utente
    try {
        const update = await User.updateOne({username: blacklist_sender}, {blacklisted_users: new_blacklist}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(docs)
            }            
        })
        res.json(new_blacklist)
        } catch (err) {
            console.log(err)
            res.json(new_blacklist)
        }
});

module.exports = router;