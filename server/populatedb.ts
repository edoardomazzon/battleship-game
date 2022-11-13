export {};

import mongoose from 'mongoose';
import User from './models/user.js';
import Notifications from './models/notification.js';
import Match from './models/match.js';
import ChatMessage from './models/chatmessage.js';
import 'dotenv/config'


const dbstring = process.env.DB_CONNECTION
if(dbstring != undefined){
    mongoose.connect(dbstring, (err) => {
        if(err){ console.log(err) } 
     }
   );
}


// Creating new data
var user1: any = new User({
    username: "Gabriele",
    email: "870751@stud.unive.it",
    role: "regular",
    max_winstreak: 3,
    current_winstreak: 1,
    shots_fired: 244,
    shots_hit: 100,
    accuracy: 41,
    games_played: 13,
    games_won: 4,
    pending_friend_requests: [],
    friends_list: [],
    blacklisted_users: [],
    recently_played: [],
    isbanned: false,
    needspasswordchange: false
})
var user2: any = new User({
    username: "Edoardo",
    email: "870606@stud.unive.it",
    role: "regular",
    max_winstreak: 5,
    current_winstreak: 2,
    shots_fired: 331,
    shots_hit: 232,
    accuracy: 70,
    games_played: 17,
    games_won: 10,
    pending_friend_requests: [],
    friends_list: [],
    blacklisted_users: [],
    recently_played: [],
    isbanned: false,
    needspasswordchange: false
})
var user3: any = new User({
    username: "Filippo",
    email: "flippo.bergamasco@unive.it",
    role: "regular",
    max_winstreak: 4,
    current_winstreak: 4,
    shots_fired: 154,
    shots_hit: 113,
    accuracy: 73,
    games_played: 4,
    games_won: 4,
    pending_friend_requests: [],
    friends_list: [],
    blacklisted_users: [],
    recently_played: [],
    isbanned: false,
    needspasswordchange: false
})
var admin: any = new User({
    username: "Administrator",
    email: "administrator@battleshipgame.com",
    role: "admin",
    needspasswordchange: false
})

// Setting passwords
user1.setPassword("pass")
user2.setPassword("pass")
user3.setPassword("pass")
admin.setPassword("admin")

// Deleting every document and inserting the above users
try{
    User.deleteMany({}).then(() => {
        console.log("   Deleted all users")
        Notifications.deleteMany({}).then(() => {
            console.log("   Deleted all notifications")
            Match.deleteMany({}).then(() => {
                console.log("   Deleted all matches")
                ChatMessage.deleteMany({}).then(() => {
                    console.log("   Deleted all chat messages")                    
                    user1.save().then(() => {
                        user2.save().then(() => {
                            user3.save().then(() => {
                                admin.save().then(() => {
                                    console.log("Inserted new data.")
                                    console.log('\x1b[33m%s\x1b[0m', "Run \"npm start\" to start the Node.js server.")
                                    mongoose.disconnect()
    })})})})})})})})
}catch(err){
    console.log(err)
}
