const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const router = express.Router();

// When a new chat message is sent, the server is notified through a POST request and saves it in the database
router.post("/", async (req, res, next) => {
    const newmessage = ChatMessage.newChatMessage(req.body)
    const insert = await newmessage.save().then( () => {
        return res.status(200).json({error: false, errormessage: "", message: "Messaggio inviato e salvato in DB"})
    }).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
});


// This method returns the last 10 messages between two users
router.put("/", async (req, res) => {
    var last10messages = []
    try{
        const select = await ChatMessage.find( {$or: [{from: req.body.from, to: req.body.to}, {from: req.body.to, to: req.body.from}]},
            function(err, docs){
                if (err){}
                else{
                    for(let i = 0; i < docs.length; i++){
                        last10messages.push(docs[i])                        
                    }
                    res.json(last10messages.reverse())
                 }
            }).sort({timestamp: -1}).skip(0).limit(10)
    }catch(err){
        console.log(err)
    }
});

module.exports = router;