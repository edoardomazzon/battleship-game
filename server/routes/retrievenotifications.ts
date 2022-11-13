import * as express from 'express'
const router = express.Router()
import Notification from '../models/notification'

// When a user opens the notifications panel, he sends a POST request to the server which responds with all the user's unread notifications
router.post('/', async(req, res) => {
    try{
        Notification.find({user: req.body.username}).then((result) => {
            res.json(result)
        })
    }catch(err){
        console.log(err)
    }
})

export default router