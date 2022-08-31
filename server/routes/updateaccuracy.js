const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

router.post('/', async(req, res) => {
    const username = req.body.username
    const hit = req.body.hit
    var total_shots_fired = 0
    var total_shots_hit = 0
    var newaccuracy

    try{
        const select = await User.findOne({username: username}).then((result) => {
            total_shots_fired = result.shots_fired
            total_shots_hit   = result.shots_hit
            total_shots_fired = total_shots_fired + 1
            if(hit){
                total_shots_hit = total_shots_hit + 1
            }    
            newaccuracy = Math.round(total_shots_hit * 100 / total_shots_fired)

            const update = User.updateOne({username: username}, {
                $set:{
                    accuracy: newaccuracy,
                    shots_fired: total_shots_fired,
                    shots_hit: total_shots_hit
                }
            }).then()
        })
        res.json('Accuracy updated')
    }catch(err){
        res.json(err)
        console.log(err)
    }
})

module.exports = router