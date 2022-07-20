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
    var update_success = 0
    console.log('CHI HA ACCETTAO LA RICHIESTA DI AMICIZIA: ', accept_sender)
    console.log('CHI HA INVIATO LA RICHIESTA DI AMICIZIA: ', accept_receiver)

    var list = new Array()
    //Nella lista di chi ha accettato la richiesta mettiamo il nome di chi l'ha inviata
    //Ovvero: nella friends_list di B compare il nome di A
    list = (await User.findOne({username: accept_sender})).friends_list
    list.push(accept_receiver)
    try {
        const update1 = await User.updateOne({username: accept_sender}, {friends_list: list}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(docs)
            }
        })
        res.json('Friends List updated')
        } catch (err) {
        res.json({ message: err })
        }
        
    //Nella lista di chi ha inviato la richiesta mettiamo il nome di chi l'ha accettata
    //Ovvero: nella friends_list di A compare il nome di B
    list = (await User.findOne({username: accept_receiver})).friends_list
    list.push(accept_sender)
    try {
        const update3 = await User.updateOne({username: accept_receiver}, {friends_list: list}, function(err, docs){
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
    
     //Aggiorniamo la pending_friend_requests
     try{
        var new_pending_list = new Array()
        new_pending_list = (await User.findOne({username: accept_sender})).pending_friend_requests
        console.log('OLD PENDING LIST: ', new_pending_list)
        let i = 0
        var receiver_index = 0
    
        for(i=0; i <= new_pending_list.length; i++){
            if(new_pending_list[i] == accept_receiver){
                receiver_index = i
                break
            }
        }
        delete new_pending_list[receiver_index]
        for(i = receiver_index; i < new_pending_list.length-1; i++){
            new_pending_list[i]=new_pending_list[i+1]
        }
        new_pending_list[i]=undefined
        console.log('NEW PENDING LIST: ', new_pending_list)
        try {
            const update2 = await User.updateOne({username: accept_sender}, {pending_friend_requests: new_pending_list}, function(err, docs){
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Updated Docs : ", docs);
                }
            })
            res.json('Pending Friend Requests List updated')
            } catch (err) {
            res.json({ message: err })
            }
        }catch(err){
            console.log(err)
        }
     
    });

   


module.exports = router;