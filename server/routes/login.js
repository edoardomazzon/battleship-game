const express = require('express');
const User = require('../models/User');
const router = express.Router();
var crypto = require('crypto'); //Anche qui hashiamo la password per confrontarla con quella nel db che è già hashata di per sè

router.post('/', async (req, res) => {
    //Creiamo un documento User di mongodb ma solo con username e passowrd
    const authuser = new User({
        username: req.body.username,
        password: crypto.createHash('sha256').update(crypto.createHash('sha256').update(req.body.password).digest('hex')).digest('hex')
    })
    try {
        //Facciamo SELECT in base all'username messo
        const found_user = await User.findOne({username: authuser.username}).exec();
        if (found_user){ //Se troviamo effettivamente un utente con quel username
            const found_password = found_user.password;
            if (found_password == authuser.password) { //Controlliamo la password
                res.json({ message: 'Loggato correttamente'}); //Rispondiamo di conseguenza
            }else {
                res.json({ message: 'Username o password errati'});
            }
        }else {
            res.json({ message: 'Username o password errati'});
        }
    }catch (err) {
        res.json({ message: err })
    }
});

module.exports = router;