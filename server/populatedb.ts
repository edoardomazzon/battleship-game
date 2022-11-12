export {};
require('dotenv/config');
const mongoose = require('mongoose')
const User = require('./models/user.js');
const Notifications = require('./models/notification.js')
const Match = require('./models/match.js')
const ChatMessage = require('./models/chatmessage.js')

mongoose.connect(
  process.env.DB_CONNECTION, () => console.log('\x1b[36m%s\x1b[0m', "Connected to Mongoose Database. \nDeleting all documents"), (err) => {
     if(err){ console.log(err) } 
  }
);

// Creating new data
var user1 = new User({
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
var user2 = new User({
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
var user3 = new User({
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
var admin = new User({
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
