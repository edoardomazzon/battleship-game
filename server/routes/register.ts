import * as express from 'express'
import User from '../models/user'
const router = express.Router()

// When a user registers, his information is saved in a new inserted db user
router.post('/', async (req, res) => {

    // Checking if a user with that username or email already exists 
    var u: any = new User(req.body);
    await User.findOne({$or:[{username: u.username}, {email: u.email}]}).then((result) => {
      if(result != null && result.username == u.username && result.email == u.email){ // Both username and email already in use
        res.json('case0')
      }
      else if(result != null && result.username == u.username){ // Username already in use
        res.json('case1')
      }
      else if(result != null && result.email == u.email){ // Email already in use
        res.json('case2')
      }
      else{
        u.role = 'regular';
        u.max_winstreak = 0;
        u.current_winstreak = 0;
        u.games_played = 0;
        u.games_won = 0;
        u.shots_fired = 0;
        u.shots_hit = 0;
        u.accuracy = 0;
        u.friends_list = [];
        u.blacklisted_users = [];
        u.pending_friend_requests = [];
        u.recently_played = [];
        u.isbanned = false;
        u.setPassword(req.body.password);
        // Inserting the user in the db
        try {
            const newUser = u.save()
            res.json(newUser)
        } catch (err) {
          res.json({ message: err })
        }
      }
    })
  });
  
 export default router;