import * as express from 'express'
const router = express.Router()
import User from '../models/user'

// When a user loses a game, we set his current_winstreak field to 0
router.post('/', async(req, res) => {
    const username = req.body.username
    try{
        User.updateOne({username: username}, { current_winstreak: 0}).then()        
    }catch(err){
        console.log(err)
    }
})

export default router