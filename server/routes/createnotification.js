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
    newnotif.save()
})

module.exports = router