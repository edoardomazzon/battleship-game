const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const { update } = require('../models/User');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256']
});


/*
Attivata quando un utente A invia la richiesta di amicizia ad un altro utente B. Il parametro principale nel body è lo username di B
che essendo UNIQUE identificherà univocamente l'utente a cui si invia la richiesta.
*/
router.post("/", async (req, res) => {
    const accept_sender = req.body.sender
    const accept_receiver = req.body.receiver
    var friendslist1 = new Array()
    user = await User.findOne({username: accept_sender})

    //Nella lista di chi ha accettato la richiesta mettiamo il nome di chi l'ha inviata
    //Ovvero: nella friends_list di B compare il nome di A    
    friendslist1 = user.friends_list
    friendslist1.push(accept_receiver)

    try {
        //Prima update -- Friends List
        const update1 = await User.updateOne({username: accept_sender}, {friends_list: friendslist1}, function(err, docs){
            if (err){}
            else{}
        })
        } catch (err) {}
        
    //Nella lista di chi ha inviato la richiesta mettiamo il nome di chi l'ha accettata
    //Ovvero: nella friends_list di A compare il nome di B
    var friendslist2 = new Array()
    user2 = await User.findOne({username: accept_receiver})
    friendslist2 = user2.friends_list
    friendslist2.push(accept_sender)
    try {
        const update2 = await User.updateOne({username: accept_receiver}, {friends_list: friendslist2}, function(err, docs){
            if (err){}
            else{}
        })
        res.json(friendslist1) //Ritorno al client di chi ha accettato l'amicizia la sua nuova lista di amici
        } catch (err) {
            res.json(friendslist1)
        }
    });
   


module.exports = router;