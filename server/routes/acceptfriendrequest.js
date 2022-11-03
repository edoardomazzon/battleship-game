const express = require('express');
const User = require('../models/user.js');
const router = express.Router();

// Activated when a user A accepts a user B's friend request
router.post("/", async (req, res) => {
    const accept_sender = req.body.sender // The accept sender is A, becaus it is the one who sends the "accept" message
    const accept_receiver = req.body.receiver // The accept receiver is B, since it is the one who sent the request in the first place
    var friendslist1 = new Array()
    var user = await User.findOne({username: accept_sender})

    // Pushing B's username into A's Friends List
    friendslist1 = user.friends_list
    friendslist1.push(accept_receiver)

    try {
        await User.updateOne({username: accept_sender}, {friends_list: friendslist1})
    } catch (err) {
            console.log(err)
    }
        
    // Pushing A's username into B's Friends List
    var friendslist2 = new Array()
    var user2 = await User.findOne({username: accept_receiver})
    friendslist2 = user2.friends_list
    friendslist2.push(accept_sender)
    try {
        await User.updateOne({username: accept_receiver}, {friends_list: friendslist2})
        res.json(friendslist1) // Returning to A's client his new friends list so it can update its localstorage and component fields
    } catch (err) {
            console.log(err)
        }
    });

module.exports = router;