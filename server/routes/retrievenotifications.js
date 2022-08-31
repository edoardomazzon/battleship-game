const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.js');

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