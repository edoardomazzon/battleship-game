const express = require('express');
const User = require('../models/User');
const router = express.Router();

//Attivata quando un utente A rifiuta la richiesta di amicizia ad un altro utente B.

router.post("/", async (req, res) => {
    const reject_receiver = req.body.receiver
    const reject_sender = req.body.sender
    var new_pending_list = new Array()

    const user = await User.findOne({username: reject_sender})
    
    new_pending_list = user.pending_friend_requests
    let i = 0
    var receiver_index = 0

    //Scorriamo la pending_friends_request di chi ha rifiutato la richiesta fino a che non troviamo il nome di chi l'ha inviata
    for(i=0; i <= new_pending_list.length; i++){
        if(new_pending_list[i] == reject_receiver){
            receiver_index = i
            break
        }
    }
    delete new_pending_list[receiver_index] //Eliminiamo dalla lista delle friend request il nome di chi l'ha inviata
    for(i = receiver_index; i < new_pending_list.length-1; i++){ //Shiftiamo a sinistra il resto dell'array
        new_pending_list[i]=new_pending_list[i+1]
    }
    
    new_pending_list.length = new_pending_list.length - 1; //Eliminiamo l'ultimo elemento dell'array
    //Effettiamo la UPDATE sulla pending_friend_requests di chi ha rifiutato la richiesta
    try {
        const update = await User.updateOne({username: reject_sender}, {pending_friend_requests: new_pending_list}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(docs)
            }            
        })
        res.json(new_pending_list)
        } catch (err) {
            console.log(err)
            res.json(new_pending_list)
        }
});


module.exports = router;