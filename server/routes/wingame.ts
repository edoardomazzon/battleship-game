import * as express from 'express'
const router = express.Router()
import User from '../models/user'
import Match from '../models/match'

// When a user wins a game, we increment his games_won counter as well as his current winstreak. If his current winstreak is 
// greater than his max winstreak, the current winstreak becomes the max winstreak.
router.post('/', (req, res) => {
    const username = req.body.username
    var player1
    var player2

    // Updating the match with the actual winner
    if(req.body.username.localeCompare(req.body.enemy) < 0){
        player1 = req.body.username
        player2 = req.body.enemy
    }
    else{
        player1 = req.body.enemy
        player2 = req.body.username
    }
    Match.updateOne({player1: player1, player2: player2, timestamp: req.body.timestamp}, {winner: req.body.username}).then(() => {
        res.json('ok')
    })

    // Finding the winner to update his winstreaks and win statistics
    var currentmax = 0
    var currentwinstreak = 0

    User.findOne({username: username}).then((result: any) => {
        currentmax = result.max_winstreak
        currentwinstreak = result.current_winstreak + 1
    })

    User.updateOne({username: username}, { $inc:{games_won: 1, current_winstreak: 1}}).then()

    if(currentwinstreak > currentmax){ User.updateOne({username: username}, { $inc:{max_winstreak: 1}}).then() }
})

export default router