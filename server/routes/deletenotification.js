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
    try{
        Notification.deleteMany({user: req.body.notification.user, from: req.body.notification.from, notification_type: req.body.notification.notification_type}).then()
    }catch(err){
        console.log(err)
    }    
})

module.exports = router