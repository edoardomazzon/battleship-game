const express = require('express');
const passport = require('passport'); // authentication middleware for express
const passportHTTP = require('passport-http'); // implements Basic and Digest authentication for HTTP (used for /login endpoint)
const jwt_decode = require('jwt-decode'); // Decoding of jwt tokens   
const jsonwebtoken = require('jsonwebtoken'); // JWT generation
const { expressjwt: jwt } = require("express-jwt");



const User = require('../models/User');
const router = express.Router();
var crypto = require('crypto'); //Anche qui hashiamo la password per confrontarla con quella nel db che è già hashata di per sè
const { use } = require('passport');



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

        User.getModel().findOne({
            username: username
        }, (err, user) => {

            if (err) {
                return done({
                    statusCode: 500,
                    error: true,
                    errormessage: err
                });
            }
            if (!user) {
                return done({
                    statusCode: 500,
                    error: true,
                    errormessage: "Invalid user"
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


router.get("/", passport.authenticate("basic", {
    session: false
}),
async (req, res, next) => {
    // If we reach this point, the user is successfully authenticated and
    // has been injected into req.user

    // We now generate a JWT with the useful user data
    // and return it as response    
    var tokendata = {
        username: req.user.username,
        role: req.user.role
    };
    //Login avvenuto con successo, genera il token
    var token_signed = jsonwebtoken.sign(
        tokendata,
        process.env.JWT_SECRET, {
            expiresIn: "1h"
        }
    );

    //Costruiamo un JSON con i dati non sensibili dell'utente da ritornare al client
    //così che il client possa salvarselo in localstorage e recuperarne i dati in modo semplice
    const logged_username = jwt_decode(token_signed);
    var logged_user = await User.findOne({username: logged_username.username});
    logged_user.password = undefined;
    logged_user.salt = undefined;
    logged_user.digest = undefined;

    return res
        .status(200)
        .json({
            error: false,
            errormessage: "",
            token: token_signed, //Rispondiamo con il token
            user: logged_user    //e con il JSON contenente i dati dell'utente
        });
    }
);

module.exports = router;