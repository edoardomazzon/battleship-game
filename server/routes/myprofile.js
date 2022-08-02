const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', function (req, res) {
    res.send('MyProfile')
});

router.post('/', async(req, res) => {
    var user = req.body.username
    try{
        const select = await User.findOne( {username: user},
            function(err, docs){
                if (err){
                    console.log('Errore', err)
                }
                else{
                    console.log('Restituisco le info sull\'utente')
                 }
                res.json(docs)
            })
    }catch(err){
        console.log('Errore:', err)
    }
})


module.exports = router;
 