const express = require('express');
const passport = require('passport'); // authentication middleware for express
const passportHTTP = require('passport-http'); // implements Basic and Digest authentication for HTTP (used for /login endpoint)
const jwt_decode = require('jwt-decode'); // Decoding of jwt tokens   
const jsonwebtoken = require('jsonwebtoken'); // JWT generation
const { expressjwt: jwt } = require("express-jwt");
const User = require('../models/user.js');
const router = express.Router();
const result = require("dotenv").config(); 

if (result.error) {
    console.log(
        'Unable to load ".env" file. Please provide one to store the JWT secret key'
    );
    process.exit(-1);
}
if (!process.env.JWT_SECRET) {
    console.log(
        '".env" file loaded but JWT_SECRET=<secret> key-value pair was not found'
    );
    process.exit(-1);
}

//Telling the app to use the RS256 algotithm for the JWT_SECRET
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['RS256']
});

passport.use(
    new passportHTTP.BasicStrategy(function(username, password, done) {
        User.findOne({ username: username }, (err, user) => {
            if(!user || err){
                return done(null, "error")
            }
            if (user.validatePassword(password)) {
                return done(null, user);
            }
            return done(null, "error")
        });
    })
);

// Passport's authentication function injects "user" inside the request "rec"
router.get("/", passport.authenticate("basic", {session: false}), async (req, res) => {
    // If Passport's authentication function returns an "error", 
    // it means the user has given us wrong credentials
    if(req.user == "error"){
        return res.json("error")
    }
    // If we reach this point, the user is successfully authenticated
    if(req.user.isbanned){
        return res.json('banned')
    }
    if(req.user.needspasswordchange){
        return res.json({
            needspasswordchange: true,
            username: req.user.username
        })
    }
    else{
        // Generating a JSONWebToken  
        var tokendata = {
            username: req.user.username,
            role: req.user.role
        };
        // Generate a signed Authentication Token
        var token_signed = jsonwebtoken.sign(
            tokendata,
            process.env.JWT_SECRET, {
                expiresIn: "5h"
            }
        );
        // Creating a JSON with user data to save in local storage
        const logged_username = jwt_decode(token_signed);
        var logged_user = await User.findOne({username: logged_username.username});
        logged_user.password = undefined;
        logged_user.salt = undefined;
        logged_user.digest = undefined;        
        
        return res.status(200).json({
            error: false,
            errormessage: "",
            token: token_signed,
            user: logged_user
        });
    }    
});

// When a user changes a password
router.post("/", async (req, res) =>{
    try{
        await User.findOne({username: req.body.username}).then((result) => {
            var temp = new User(result)
            temp.setPassword(req.body.newpassword)
            User.updateOne({username: req.body.username}, {password: temp.password, salt: temp.salt, digest: temp.digest, needspasswordchange: false}).then(() => {
                res.json('ok')
            })
        })
    } catch(err){
        console.log(err)
    }

})

module.exports = router;