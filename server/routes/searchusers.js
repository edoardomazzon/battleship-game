const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async(req, res) => {
    const input = req.body.searched_name
    try{
        const select = await User.find({username: { $regex: '.*' + input + '.*', $options: 'i' }},
            function(err, docs){
                if (err){
                    console.log(err)
                }
                else{
                    console.log('Returning searched users')
                 }
                res.json(docs)
            }).limit(5).select('username -_id')
    }catch(err){
        console.log(err)
    }
})

module.exports = router