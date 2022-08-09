const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Activated when a user A blacklists a user B
router.post("/", async (req, res) => {
    const blacklist_receiver = req.body.receiver
    const blacklist_sender = req.body.sender
    var new_blacklist = new Array()
    const user = await User.findOne({username: blacklist_sender})
    new_blacklist = user.blacklisted_users
    new_blacklist.push(blacklist_receiver)
    
    // Updating A's blacklist with B's name in it
    try {
        const update = await User.updateOne({username: blacklist_sender}, {blacklisted_users: new_blacklist})
        res.json(new_blacklist)
    } catch (err) {
            console.log(err)
        }
});

module.exports = router;