const express = require('express');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const io = require('../app') //importiamo io da app.js
const router = express.Router();

router.post("/", async (req, res) => {
    const newmessage = ChatMessage.newChatMessage(req.body)
    const from_username = newmessage.from;
    const to_username = newmessage.to;
    var channel_name = ''

    //Ordiniamo alfabeticamente i nomi degli utenti così otteniamo per entrambi un nome comune del canale su cui comunicare,
    //Perché se uno si aspetta dei messaggi su USER1USER2 ma l'altro li emette sul canale USER2USER1 non li riceverà mai
    if(from_username.localeCompare(to_username) < 0){
        channel_name = ''+from_username+''+to_username
    }else{
        channel_name = ''+to_username+''+from_username
    }
    console.log('Il nome del canale è: ', channel_name)
    
    

    const insert = await newmessage.save().then( () => {
        io.emit(channel_name, newmessage.text_content)
        return res.status(200).json({error: false, errormessage: "", message: "Messaggio inviato e salvato in DB"})
    }).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
});


// Troviamo gli ultimi 10 messaggi (ma possiamo parametrizzarlo con le options nella request) tra player1 e player2
// e li restituiamo al client che poi se li salverà nella lista "messages" di tipo ChatMessage[]
router.put("/", async (req, res) => {

    var last10messages = [] //Lista dei messaggi inviati da player1 a player2
    console.log('PLAYER 1 E\':', req.body)
    try{
        const select = await ChatMessage.find( {$or: [{from: req.body.from, to: req.body.to}, {from: req.body.to, to: req.body.from}]},
            function(err, docs){
                if (err){
                    console.log(err)
                }
                else{
                    for(let i = 0; i < docs.length; i++){
                        last10messages.push(docs[i])                        
                    }
                    console.log('LAST 10 MESSAGES BETWEEN ', req.body.from, ' AND ', req.body.to, ' ARE:', last10messages)
                    res.json(last10messages)                   
                }
            }).sort({timestamp: -1}).skip(0).limit(10)
    }catch(err){
        console.log(err)
    }

    

});

module.exports = router;