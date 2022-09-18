const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

//This method is called when getUserInfo() function is called from myprofile.component.ts; that function refreshes the user's
//localstorage as well as its component's fields with updated info from the database, so we send a response with the user.
router.post('/', async(req, res) => {
    var user = req.body.username
    try{
        await User.findOne( {username: user}).then((result) => {res.json(result)})
    }catch(err){
        console.log(err)
    }
})

module.exports = router;
 