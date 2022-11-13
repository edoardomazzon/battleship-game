import * as express from 'express'
import User from '../models/user'
import jwt_decode from 'jwt-decode'
import * as jsonwebtoken from 'jsonwebtoken'
import {expressjwt as jwt} from 'express-jwt'
import 'dotenv/config'
const router = express.Router()

const jwtsecret: any = process.env.JWT_SECRET

var auth = jwt({
    secret: jwtsecret,
    algorithms: ['RS256', 'HS256']
});

//This method is called when getUserInfo() function is called from myprofile.component.ts; that function refreshes the user's
//localstorage as well as its component's fields with updated info from the database, so we send a response with the user.
router.get('/', auth, function(req: any, res){
    var authorization_token: any = req.headers.authorization.split(' ')[1]
    var user: any = jwt_decode(authorization_token)
    const username = user.username
    try{
        User.findOne( {username: username}).then((result: any) => {
            result.digest = undefined
            result.salt = undefined
            res.json(result)})
    }catch(err){
        console.log(err)
    }
})

export default router;