import * as express from 'express'
import User from '../models/user'
const router = express.Router()

/*
This route method is activated when a user A sends a friend request to a user B; the request body contains A's username as "sender"
and B's name as "receiver". All this function has to do is to update B's pending friend requests list by adding A's username in it.
*/
router.post("/", async (req, res) => {
    const receiver: any = req.body.receiver
    const sender: any = await User.findOne({username:  req.body.sender})
    const receiver_user: any = await User.findOne({username: req.body.receiver})
    var new_pending_requests = sender.pending_friend_requests;

    //Here we obtain B's blacklist and friends list
    var blacklist = receiver_user.blacklisted_users;
    var friends_list = receiver_user.friends_list;
    var pending_friend_requests = receiver_user.pending_friend_requests;
    //If A is not blacklisted by B or if A and B are not already friends, then the friend request can be sent
    if(!blacklist.includes(sender.username) && !friends_list.includes(sender.username) && !pending_friend_requests.includes(sender.username)){
        //Adding A's username to B's new pending friend requests list with the sender's username
        new_pending_requests.push(sender.username)
        //Updating user B's pending_friend_requests by substituting it with the new one
        try {
            await User.updateOne({username: receiver}, {pending_friend_requests: new_pending_requests})
            res.json('ok')
        } catch (err) {
            console.log(err)
        }
    }
});

export default router;