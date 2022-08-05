const express = require('express');
const User = require('../models/User');
const router = express.Router();

// When a user A rejects a user B's friend request, B's username disappears from A's pending friend requests list
router.post("/", async (req, res) => {
    const remove_receiver = req.body.receiver
    const remove_sender = req.body.sender
    var newfriendslist1 = new Array()

    const user1 = await User.findOne({username: remove_sender})
    newfriendslist1 = user1.friends_list

    //Iterating through A's friends until we find the index that corresponds to B's username
    let i = 0
    var receiver_index = 0
    for(i=0; i <= newfriendslist1.length; i++){
        if(newfriendslist1[i] == remove_receiver){
            receiver_index = i
            break
        }
    }
    delete newfriendslist1[receiver_index] // Deleting B's username from the A's friends list
    for(i = receiver_index; i < newfriendslist1.length; i++){ // Shifting left the rest of the array
        newfriendslist1[i] = newfriendslist1[i+1]
    }    
    newfriendslist1.length = newfriendslist1.length - 1; // Deleting last element of the array which is a copy of the shifted last element
    try { // Updating the use A with the new friends list
        const update1 = await User.updateOne({username: remove_sender}, {friends_list: newfriendslist1}, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log('Updated '+remove_sender+'\'s friends list: ', docs)
            }            
        })
        } catch (err) {
            console.log(err)
        }

        const user2 = await User.findOne({username: remove_receiver})
        var newfriendslist2 = user2.friends_list
        console.log('LA LIST DI AMICI DELL\'ELIMINATO È: ', newfriendslist2)
    
        //Iterating through B's friends until we find the index that corresponds to A's username
        i = 0
        var sender_index = 0
        for(i=0; i <= newfriendslist2.length; i++){
            if(newfriendslist2[i] == remove_sender){
                sender_index = i
                break
            }
        }
        delete newfriendslist2[sender_index] // Deleting A's username from B's friends list
        for(i = sender_index; i < newfriendslist2.length; i++){ // Shifting left the rest of the array
            newfriendslist2[i] = newfriendslist2[i+1]
        }    
        newfriendslist2.length = newfriendslist2.length - 1; // Deleting last element of the array which is a copy of the shifted last element
        console.log('LA LIST DI AMICI DELL\'ELIMINATO È: ', newfriendslist2)


        try { // Updating the use A with the new friends list
            const update1 = await User.updateOne({username: remove_receiver}, {friends_list: newfriendslist2}, function(err, docs){
                if (err){
                    console.log(err)
                }
                else{
                    console.log('Updated '+remove_receiver+'\'s friends list: ', docs)
                }            
            })
            res.json(newfriendslist1) // Returning to A's client his new friends list so he can update the localstorage
            } catch (err) {
                res.json(newfriendslist1)
            }
    
});


module.exports = router;