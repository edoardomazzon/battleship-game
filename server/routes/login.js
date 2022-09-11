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

//Diciamo di usare l'algoritmo RS256 per il JWT_SECRET
var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['RS256']
});

passport.use(
    new passportHTTP.BasicStrategy(function(username, password, done) {
        // Delegate function we provide to passport middleware
        // to verify user credentials

        User.getModel().findOne({ username: username }, (err, user) => {
            if (err) {
                return done({
                    statusCode: 500,
                    error: true,
                    errormessage: err
                });
            }
            if (!user) {
                return done({
                    statusCode: 200,
                    error: true,
                    errormessage: "error"
                });
            }            
            if (user.validatePassword(password)) {
                return done(null, user);
            }

            return done({
                statusCode: 500,
                error: true,
                errormessage: "Invalid password"
            });
        });
    })
);

router.get("/", passport.authenticate("basic", {session: false}), async (req, res) => {
    // If we reach this point, the user is successfully authenticated and
    // has bee n injected into req.user
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
        // We now generate a JWT with the useful user data
        // and return it as response    
        var tokendata = {
            username: req.user.username,
            role: req.user.role
        };
        // Here we generate the signed user authorization token
        var token_signed = jsonwebtoken.sign(
            tokendata,
            process.env.JWT_SECRET, {
                expiresIn: "1h"
            }
        );

        // Creting a json with user data to save in local storage, but first we have to delete the password, salt and digest fields
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

// Whena user changes a password
router.post("/", async (req, res) =>{
    console.log(req.body)
    try{
        await User.findOne({username: req.body.username}).then((result) => {
            var temp = new User(result)
            console.log(temp.password, temp.salt, temp.digest)
            temp.setPassword(req.body.newpassword)
            console.log(temp.password, temp.salt, temp.digest)
            User.updateOne({username: req.body.username}, {password: temp.password, salt: temp.salt, digest: temp.digest, needspasswordchange: false}).then(() => {
                res.json('ok')
            })
        })
    } catch(err){
        console.log(err)
    }

})

module.exports = router;