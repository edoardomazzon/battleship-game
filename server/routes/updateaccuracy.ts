import * as express from 'express'
const router = express.Router()
import User from '../models/user'

// Called whenever a user takes a shot and gets the shot result back; here the accuracy is updated as well as the total shots count
// and the hit shots count
router.post('/', async(req, res) => {
    const username = req.body.username
    const hit = req.body.hit
    var total_shots_fired = 0
    var total_shots_hit = 0
    var newaccuracy

    try{
        const select = await User.findOne({username: username}).then((result: any) => {
            total_shots_fired = result.shots_fired
            total_shots_hit   = result.shots_hit
            total_shots_fired = total_shots_fired + 1
            if(hit){ total_shots_hit = total_shots_hit + 1 }    
            newaccuracy = Math.round(total_shots_hit * 100 / total_shots_fired)

            User.updateOne({username: username}, {
                $set:{
                    accuracy: newaccuracy,
                    shots_fired: total_shots_fired,
                    shots_hit: total_shots_hit
                }
            }).then()
        })
    }catch(err){
        console.log(err)
    }
})

export default router