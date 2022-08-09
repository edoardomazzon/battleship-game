const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', function (req, res) {
    res.send('MyProfile')
});

//This method is called when getUserInfo() function is called from myprofile.component.ts; that function refreshes the user's
//localstorage as well as its component's fields with updated info from the database, so we send a response with the user.
router.post('/', async(req, res) => {
    var user = req.body.username
    try{
        const query = await User.findOne( {username: user})
        .then((select) => {res.json(select)})
    }catch(err){
        console.log(err)
    }
})

module.exports = router;
 