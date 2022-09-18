const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.js');

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

module.exports = router