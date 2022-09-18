const express = require('express');
const User = require('../models/user.js');
const router = express.Router();

// When a user A unblocks user B', B's username disappears from A's blacklisted_users list
router.post("/", async (req, res) => {
    const unblocking_user = req.body.username
    const unblocked_user = req.body.blocked_user
    var newblacklist = new Array()

    const user = await User.findOne({username: unblocking_user})
    newblacklist = user.blacklisted_users

    //Iterating through A's blacklisted_users until we find the index that corresponds to B's username
    let i = 0
    var blacklisted_index = 0
    for(i=0; i <= newblacklist.length; i++){
        if(newblacklist[i] == unblocked_user){
            blacklisted_index = i
            break
        }
    }
    delete newblacklist[blacklisted_index] // Deleting B's username from the blacklisted_users list
    for(i = blacklisted_index; i < newblacklist.length-1; i++){ // Shifting left the rest of the array
        newblacklist[i]=newblacklist[i+1]
    }
    
    newblacklist.length = newblacklist.length - 1; // Deleting last element of the array which is a copy of the shifted last element
    try { // Updating the user A with the new blacklisted_users list
        await User.updateOne({username: unblocking_user}, {blacklisted_users: newblacklist}).then(() => {res.json(newblacklist)})        
    } catch (err) {
        console.log(err)
    }
});


module.exports = router;