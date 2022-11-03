const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const { expressjwt: jwt } = require("express-jwt");
const jwtdecode = require('jwt-decode');

var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256']
});

//This method is called when getUserInfo() function is called from myprofile.component.ts; that function refreshes the user's
//localstorage as well as its component's fields with updated info from the database, so we send a response with the user.
router.get('/', auth, function(req, res){
    var authorization_token = req.headers.authorization.split(' ')[1];
    var username = jwtdecode(authorization_token).username    
    try{
        User.findOne( {username: username}).then((result) => {
            result.digest = undefined
            result.salt = undefined
            res.json(result)})
    }catch(err){
        console.log(err)
    }
})

module.exports = router;
 