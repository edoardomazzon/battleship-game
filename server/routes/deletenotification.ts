import * as express from 'express'
const router = express.Router()
import Notification from '../models/notification'

// When a user marks a notification as read, it also gets deleted from the database as it looses its purpose.
// Notification with the same type and sender also get deleted (there shouldn't exist more than 1 notification with the same type and sender,
// but we still use "deleteMany" for safety).
router.post('/', async(req, res) => {
    try{
        Notification.deleteMany({user: req.body.notification.user, from: req.body.notification.from, notification_type: req.body.notification.notification_type}).then()
    }catch(err){
        console.log(err)
    }    
})

export default router