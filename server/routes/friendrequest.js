const express = require('express');

const User = require('../models/User');
const router = express.Router();


router.post("/", async (req, res) => {
    console.log('ENTRO NELLA POST')
    const new_friend = req.body.username
    console.log('STAMPO REQUEST USERNAME: ', req.body.username)
    var list_to_change = new Array();
    var list_to_change = (await User.findOne({username: new_friend})).pending_friend_requests;
    console.log('RISULTATO QUERY: ', list_to_change)
    list_to_change.push(new_friend)
    console.log('NEW LIST: ', list_to_change)


    try {
        const update = await User.updateOne({username: new_friend}, {pending_friend_requests: list_to_change}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log("Updated Docs : ", docs);
            }
        })
        res.json('ciao')
        } catch (err) {
        res.json({ message: err })
        }

});

module.exports = router;