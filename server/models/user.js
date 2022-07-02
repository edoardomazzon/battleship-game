//Importiamo mongoose
const mongoose = require('mongoose');

//Costruiamo uno schema per l'utente con il costruttore Schema() di mongoose
const UserSchema = mongoose.Schema({
    //Per ogni attributo diamo il tipo e se è richiesto (oltre ad altre qualsiasi proprietà vogliamo)
    id: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    max_winstreak: {
        type: Number,
        required: false
    },
    current_winstreak: {
        type: Number,
        required: false
    },
    accuracy: {
        type: Number,
        required: false
    },
    pfp: {
        type: String,
        required: false
    },

})


module.exports = mongoose.model('User', UserSchema);