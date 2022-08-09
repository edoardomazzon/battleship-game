const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async(req, res) => {
    const input = req.body.searched_name
    try{
        const query = await User
        .find({username: { $regex: '.*' + input + '.*', $options: 'i' }})
        .limit(5).select('username -_id')
        .then((select) => {res.json(select)})
    }catch(err){
        console.log(err)
    }
})

module.exports = router