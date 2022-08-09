const express = require('express');
const User = require('../models/User');
const router = express.Router();

// When a user A rejects a user B's friend request, B's username disappears from A's pending friend requests list
router.post("/", async (req, res) => {
    const reject_receiver = req.body.receiver
    const reject_sender = req.body.sender
    var new_pending_list = new Array()

    const user = await User.findOne({username: reject_sender})
    new_pending_list = user.pending_friend_requests

    //Iterating through A's pending_friends_requests until we find the index that corresponds to B's username
    let i = 0
    var receiver_index = 0
    for(i=0; i <= new_pending_list.length; i++){
        if(new_pending_list[i] == reject_receiver){
            receiver_index = i
            break
        }
    }
    delete new_pending_list[receiver_index] // Deleting B's username from the pending friend requests list
    for(i = receiver_index; i < new_pending_list.length-1; i++){ // Shifting left the rest of the array
        new_pending_list[i]=new_pending_list[i+1]
    }
    
    new_pending_list.length = new_pending_list.length - 1; // Deleting last element of the array which is a copy of the shifted last element
    try { // Updating the user A with the new pending friend request list
        const update = await User.updateOne({username: reject_sender}, {pending_friend_requests: new_pending_list})
        res.json(new_pending_list)
    } catch (err) {
        console.log(err)
    }
});


module.exports = router;