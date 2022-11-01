const express = require('express');
const User = require('../models/user.js');
const Notification = require('../models/notification.js');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const jwtdecode = require('jwt-decode');

var auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256']
});

// Activate when a moderator selecets all users, bans or unbans a user, promotes a user, wipes a users's statistics or notifies all users.
// Based on the request type, one of these functionalities is utilized
router.post("/", auth, async (req, res) => {
    //Checking wether the user that performs the POST request is authenticated and has an administrator role
    var authorization_token = req.headers.authorization.split(' ')[1];
    var token = jwtdecode(authorization_token)
    if(token.role == "admin"){
        const request = req.body

        // Selecting all users from the database
        if(request.request_type == 'allusers'){
            try{
                User.find().then((result) => {
                    res.json(result)
                })
            }catch(err){
                console.log(err)
            }
        }
    
        // Banning a user
        else if(request.request_type == 'ban'){
            try{
                User.updateOne({username: request.username}, {isbanned: true}).then()
            }catch(err){
                console.log(err)
            }   
        }
    
        // Unbaning a user
        else if(request.request_type == 'unban'){
            try{
                User.updateOne({username: request.username}, {isbanned: false}).then()
            }catch(err){
                console.log(err)
            }  
        }
    
        // Promoting a user to administrator
        else if(request.request_type == 'promote'){
            try{
                User.updateOne({username: request.username}, {role: 'admin', needspasswordchange: true}).then()
            }catch(err){
                console.log(err)
            }
        }
    
        // Wiping a users's statistics
        else if(request.request_type == 'wipestats'){
            try{
                User.updateOne({username: request.username}, {
                    current_winstreak: 0,
                    max_winstreak: 0,
                    games_won: 0,
                    games_played: 0,
                    accuracy: 0,
                    shots_fired: 0,
                    shots_hit: 0
                }).then()
            }catch(err){
                console.log(err)
            }
        }
    
        // Forcing a user to change it's password
        else if(request.request_type == 'forcepasswordchange'){
            try{
                User.updateOne({username: request.username}, { needspasswordchange: true }).then()
            }catch(err){
                console.log(err)
            }
        }
    
        // Inserting notifications for each user
        else if(request.request_type == 'notifyall'){
            try{
                User.find().then((allusers) => {
                    for(i = 0; i < allusers.length; i++){
                        if(allusers[i].role != 'admin'){
                            var notif = {
                                user: allusers[i].username,
                                from: 'Moderators',
                                notification_type: 'modmessage',
                                timestamp: request.timestamp,
                                text_content: request.message
                            }
                            notif = new Notification(notif)
                            notif.save()
                        }
    
                    }
                })
            }catch(err){
                console.log(err)
            }
        }
    }
    else{
        res.status(401).json({message: "Unauthorized access", status: 401})
    }
    
});

module.exports = router;