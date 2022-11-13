import * as express from 'express'
const router = express.Router()
import Notification from '../models/notification'

// When a new notification is created, it also gets inserted into the database; if the notification is a message from the moderators,
// it gets saved automatically, whereas if it's a match invite or an unread message, it will not be inserted in the db if a similar
// notification from that same user already exists.
// I.E. If A sends a message to B, the notification is saved, but when A sends a second message to B, the notification isn't saved and
// B will be just told that he has some "unread messageS"
router.post('/', async(req, res) => {
    const newnotif = new Notification(req.body)
    if(newnotif.notification_type == 'modmessage'){
        newnotif.save()
    }

    else{
        Notification.findOne({user:newnotif.user, from: newnotif.from, notification_type: newnotif.notification_type}).then((result) => {
            if(result == null || result == undefined){
                newnotif.save()
            }
        })    
    }

})

export default router