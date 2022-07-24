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
    var new_pending_list = new Array()
    user = await User.findOne({username: accept_sender})

    //Nella lista di chi ha accettato la richiesta mettiamo il nome di chi l'ha inviata
    //Ovvero: nella friends_list di B compare il nome di A    
    friendslist1 = user.friends_list
    friendslist1.push(accept_receiver)

    
    //Scorriamo la pending_friends_request di A fino a che non troviamo il nome di B
    new_pending_list = user.pending_friend_requests
    let i = 0
        var receiver_index = 0
    
        for(i=0; i <= new_pending_list.length; i++){
            if(new_pending_list[i] == accept_receiver){
                receiver_index = i
                break
            }
        }
        delete new_pending_list[receiver_index]//Togliamo A dalla lista delle richieste di amicizia di B, visto che ora l'ha accettata
        //Shiftiamo a sinistra il resto dell'array
        for(i = receiver_index; i < new_pending_list.length-1; i++){
            new_pending_list[i]=new_pending_list[i+1]
        }
        new_pending_list.length = new_pending_list.length - 1; //Eliminiamo l'ultimo elemento dell'array
    
    try {
        //Prima update -- Friends List
        const update1 = await User.updateOne({username: accept_sender}, {friends_list: friendslist1}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(docs)
            }
        })
        } catch (err) { console.log(err) }

    try {
        //seconda update -- Friend Requests List
        const update2 = await User.updateOne({username: accept_sender}, {pending_friend_requests: new_pending_list}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(docs)
            }
        })
        } catch (err) {
            console.log(err)
        }
        
    //Nella lista di chi ha inviato la richiesta mettiamo il nome di chi l'ha accettata
    //Ovvero: nella friends_list di A compare il nome di B
    var friendslist2 = new Array()
    friendslist2 = (await User.findOne({username: accept_receiver})).friends_list
    friendslist2.push(accept_sender)
    try {
        const update3 = await User.updateOne({username: accept_receiver}, {friends_list: friendslist2}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log("Updated Docs : ", docs);
            }
        })
        res.json('Friends List updated')
        } catch (err) {
        res.json({ message: err })
        }
    });
   


module.exports = router;