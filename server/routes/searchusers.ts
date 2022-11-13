import * as express from 'express'
const router = express.Router()
import User from '../models/user'

// Used when a user looks up some other usernames; returns the 5 users with the most similar username as the one typed in
router.post('/', async(req, res) => {
    const input = req.body.searched_name
    try{
        const query = await User
        .find({username: { $regex: '.*' + input + '.*', $options: 'i' }})
        .limit(5).select('username -_id') // Returning just the username
        .then((select) => {res.json(select)})
    }catch(err){
        console.log(err)
    }
})

export default router