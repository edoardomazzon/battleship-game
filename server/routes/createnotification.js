// var notification = {
//     user: friend,
//     from: current_user,
//     notification_type: 'matchinvite',
//     timestamp: new Date()
//   }
const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.js');

router.post('/', async(req, res) => {
    const newnotif = new Notification(req.body)

    Notification.findOne({user:newnotif.user, from: newnotif.from, notification_type: newnotif.notification_type}).then((result) => {
        if(result == null || result == undefined){
            newnotif.save()
        }
    })    
})

module.exports = router