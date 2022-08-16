const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async(req, res) => {
    const username = req.body.username
    
    try{
        const update = User.updateOne({username: username}, { $inc:{games_won: 1}})
        res.json('Updated games_won')
    }catch(err){
        res.json(err)
        console.log(err)
    }
})

module.exports = router