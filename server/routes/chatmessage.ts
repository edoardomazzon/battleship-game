import * as express from 'express'
const router = express.Router()
import ChatMessage from '../models/chatmessage'

// When a new chat message is sent, the server is notified through a POST request and saves it in the database
router.post("/", async (req, res) => {
    const newmessage = new ChatMessage(req.body)
    await newmessage.save()
});


// This method returns the last 25 messages between two users
router.put("/", async (req, res) => {
    var lastmessages: any = []
    try{
        const query = await ChatMessage
        .find( {$or: [{from: req.body.from, to: req.body.to}, {from: req.body.to, to: req.body.from}]})
        .sort({timestamp: -1})
        .skip(0)
        .limit(25)
        .then((select) => {
            for(let i = 0; i < select.length; i++){
                lastmessages.push(select[i])                        
            }
            res.json(lastmessages.reverse())})
    }catch(err){
        console.log(err)
    }
});

export default router;