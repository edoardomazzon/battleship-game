const express = require('express');
const passport = require('passport'); // authentication middleware for express
const passportHTTP = require('passport-http'); // implements Basic and Digest authentication for HTTP (used for /login endpoint)

const jsonwebtoken = require('jsonwebtoken'); // JWT generation
//var jwt = require('express-jwt');
const { expressjwt: jwt } = require("express-jwt");



const User = require('../models/User');
const router = express.Router();
var crypto = require('crypto'); //Anche qui hashiamo la password per confrontarla con quella nel db che è già hashata di per sè
const { use } = require('passport');


const result = require("dotenv").config(); // The dotenv module will load a file named ".env"
// file and load all the key-value pairs into
// process.env (environment variable)
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

var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['RS256']
});

passport.use(
    new passportHTTP.BasicStrategy(function(username, password, done) {
        // Delegate function we provide to passport middleware
        // to verify user credentials

        console.log("Nuova richiesta di login da " + username);
        User.getModel().findOne({
            username: username
        }, (err, user) => {

            console.log("Verifica login " + username + " type of" + typeof username   + password + " type of" + typeof password) 
            
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
            console.log("user" + user)
            if (user.validatePassword(password)) {
                console.log("entra")
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
(req, res, next) => {
    // If we reach this point, the user is successfully authenticated and
    // has been injected into req.user

    // We now generate a JWT with the useful user data
    // and return it as response

    var tokendata = {
        username: req.user.username
    };

    console.log("Login avvenuto con successo. Sto generando il token");
    var token_signed = jsonwebtoken.sign(
        tokendata,
        process.env.JWT_SECRET, {
            expiresIn: "1h"
        }
    );

    // Note: You can manually check the JWT content at https://jwt.io

    return res
        .status(200)
        .json({
            error: false,
            errormessage: "",
            token: token_signed
        });
}
);

/*router.post('/', async (req, res) => {
    //Creiamo un documento User di mongodb ma solo con username e passowrd
    const authuser = new User({
        username: req.body.username,
        password: crypto.createHash('sha256').update(crypto.createHash('sha256').update(req.body.password).digest('hex')).digest('hex')
    })
    try {
        //Facciamo SELECT in base all'username messo
        const found_user = await User.findOne({username: authuser.username}).exec();
        if (found_user){ //Se troviamo effettivamente un utente con quel username
            const found_password = found_user.password;
            if (found_password == authuser.password) { //Controlliamo la password
                res.json({ message: 'Loggato correttamente'}); //Rispondiamo di conseguenza
            }else {
                res.json({ message: 'Username o password errati'});
            }
        }else {
            res.json({ message: 'Username o password errati'});
        }
    }catch (err) {
        res.json({ message: err })
    }
});
*/

module.exports = router;