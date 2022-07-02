//Importiamo mongoose
const mongoose = require('mongoose');

//Costruiamo uno schema per l'utente con il costruttore Schema() di mongoose
const UserSchema = mongoose.Schema({
    //Per ogni attributo diamo il tipo e se è richiesto (oltre ad altre qualsiasi proprietà vogliamo)
    id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    max_winstreak: {
        type: Number,
        required: true
    },
    current_winstreak: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        required: true
    },
    pfp: {
        type: String,
        required: false
    },

})


module.exports = mongoose.model('User', UserSchema);