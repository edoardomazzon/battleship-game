const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256']
});


/*
Attivata quando un utente A invia la richiesta di amicizia ad un altro utente B. Il parametro principale nel body è lo username di B
che essendo UNIQUE identificherà univocamente l'utente a cui si invia la richiesta.
*/
router.post("/", async (req, res) => {
    //Prendiamo il nome utente del sender e del receiver
    const receiver = req.body.receiver
    const sender = req.body.sender
    const user = await User.findOne({username: receiver})
    //Creiamo un array in cui verrà copiata la pending_friend_requests di B
    var list_to_change = new Array();
    var list_to_change = user.pending_friend_requests;

    //Se A non è nella blacklist di B
    if(!list_to_change.includes(sender)){
        list_to_change.push(sender) //Aggiungiamo il nome utente di A nella pending_friend_requests di B

        //Ora effettuiamo la UPDATE sull'utente B sostituendone la vecchia pending_fiend_requests con quella nuova, che ora ha anche lo
        //username di A
        try {
            const update = await User.updateOne({username: receiver}, {pending_friend_requests: list_to_change}, function(err, docs){
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Updated Docs : ", docs);
                }
            })
            res.json('Friend Requests List updated')
            } catch (err) {
            res.json({ message: err })
        }
    }
    else{
        res.json('Impossibile inviare la richiesta di amicizia: l\'utente a cui vuoi chiedere l\'amicizia ti ha inserito nella sua blacklist.')
    }
});

module.exports = router;