const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Activated when a user A accepts a user B's friend request
router.post("/", async (req, res) => {
    const accept_sender = req.body.sender // The accept sender is A, becaus it is the one who sends the "accept" message
    const accept_receiver = req.body.receiver // The accept receiver is B, since it is the one who sent the request in the first place
    var friendslist1 = new Array()
    user = await User.findOne({username: accept_sender})

    // Pushing B's username into A's Friends List
    friendslist1 = user.friends_list
    friendslist1.push(accept_receiver)

    try {
        const update1 = await User.updateOne({username: accept_sender}, {friends_list: friendslist1}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(accept_sender+' ha accettato la richiesta di amicizia di '+accept_receiver)
            }
        })
        } catch (err) {
            console.log(err)
        }
        
    // Pushing A's username into B's Friends List
    var friendslist2 = new Array()
    user2 = await User.findOne({username: accept_receiver})
    friendslist2 = user2.friends_list
    friendslist2.push(accept_sender)
    try {
        const update2 = await User.updateOne({username: accept_receiver}, {friends_list: friendslist2}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log(accept_receiver+' è stato accettato come amico da '+accept_sender)
            }
        })
        res.json(friendslist1) // Returning to A's client his new friends list so it can update its localstorage and component fields
        } catch (err) {
            res.json(friendslist1)
        }
    });

module.exports = router;