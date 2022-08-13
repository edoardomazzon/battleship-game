const express = require('express');
const Match = require('../models/Match');
const router = express.Router();

router.post("/", async (req, res) => {
    var newmatch = new Match(req.body)
    try{
        const insert = await newmatch.save()
        res.json(newmatch)
    }catch(err){
        console.log(err)
    }
    
});

module.exports = router;