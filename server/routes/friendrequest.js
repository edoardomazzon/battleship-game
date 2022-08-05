const express = require('express');
const User = require('../models/User');
const router = express.Router();

/*
This route method is activated when a user A sends a friend request to a user B; the request body contains A's username as "sender"
and B's name as "receiver". All this function has to do is to update B's pending friend requests list by adding A's username in it.
*/
router.post("/", async (req, res) => {
    const receiver = req.body.receiver
    const sender = await User.findOne({username:  req.body.sender})
    const receiver_user = await User.findOne({username: req.body.receiver})
    var new_pending_requests = sender.pending_friend_requests;

    //Here we obtain B's blacklist and friends list
    var blacklist = receiver_user.blacklisted_users;
    var friends_list = receiver_user.friends_list;

    //If A is not blacklisted by B or if A and B are not already friends, then the friend request can be sent
    if(!blacklist.includes(sender.username) || friends_list.includes(sender.username)){
        //Adding A's username to B's new pending friend requests list with the sender's username
        new_pending_requests.push(sender.username)
        //Updating user B's pending_friend_requests by substituting it with the new one
        try {
            const update = await User.updateOne({username: receiver}, {pending_friend_requests: new_pending_requests}, 
                function(err, docs){
                    if (err){
                        console.log(err)
                    }
                    else{
                        console.log("Updated "+ receiver+"\'s friend requests list with "+ sender+"\'s request");
                    }
                })
            res.json('Friend Requests List updated')
            } catch (err) {
            res.json({ message: err })
        }
    }
    else{
        res.json('Can\'t send friend request: '+receiver+' is already in your friends list or has blacklisted you')
    }
});

module.exports = router;