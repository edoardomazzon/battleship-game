const mongoose = require('mongoose');
var crypto = require("crypto");

const UserSchema = mongoose.Schema({
    role:{
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
    shots_fired: {
        type: Number,
        required: false
    },
    shots_hit: {
        type: Number,
        required: false
    },
    accuracy: {
        type: Number,
        required: false
    },
    games_played: {
        type: Number,
        required: false
    },
    games_won: {
        type: Number,
        required: false
    },
    pfp: {
        type: String,
        required: false
    },
    pending_friend_requests: {
        type: Array,
        required: false
    },
    friends_list: {
        type:  Array,
        required: false
    },
    blacklisted_users: {
        type:  Array,
        required: false
    },
    salt: {
        type: String,
        required: false
    },
    digest: {
        type: String,
        required: false
    }
})

UserSchema.methods.setPassword = function (pwd) {
    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt
    // We use the hash function sha512 to hash both the password and salt to
    // obtain a password digest 
    // 
    // From wikipedia: (https://en.wikipedia.org/wiki/HMAC)
    // In cryptography, an HMAC (sometimes disabbreviated as either keyed-hash message 
    // authentication code or hash-based message authentication code) is a specific type 
    // of message authentication code (MAC) involving a cryptographic hash function and 
    // a secret cryptographic key.
    //
    var hmac = crypto.createHmac('sha256', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
};

UserSchema.methods.validatePassword = function (pwd) {
    // To validate the password, we compute the digest with the
    // same HMAC to check if it matches with the digest we stored
    // in the database.

    var hmac = crypto.createHmac("sha256", this.salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.digest === digest);
};

function getSchema() { return UserSchema; }
module.exports.getSchema = getSchema;
// Mongoose Model
var userModel; // This is not exposed outside the model
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}

function newUser(data) {
    var _usermodel = getModel();
    var user = new _usermodel(data);
    return user;
}


module.exports = mongoose.model('User', UserSchema);
module.exports.getModel = getModel;
module.exports.newUser = newUser;