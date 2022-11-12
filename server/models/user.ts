import {Schema, model} from 'mongoose'
import {createHmac, randomBytes} from 'crypto'

const UserSchema = new Schema({
    role:{
        type: String,
        required: false
    },
    email: {
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
    recently_played: {
        type: Array,
        required: false
    },
    isbanned: {
        type: Boolean,
        required: false
    },
    needspasswordchange: {
        type: Boolean,
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
    // Generating a 16 Bytes string to enforce the password hash
    this.salt = randomBytes(16).toString('hex');
    // Creating an Hashed Message Authentication Code based on the salt with the SHA256 algorith
    var hmac = createHmac('sha256', this.salt);
    // Updating the HMAC with the password
    hmac.update(pwd);
    // Updating the user's "digest" field which now contains the salt and the password
    this.digest = hmac.digest('hex'); 
};

// To validate the password, we compute the digest with the
// same HMAC to check if it matches with the digest we stored
// in the database.
UserSchema.methods.validatePassword = function (pwd) {
    var hmac = createHmac("sha256", this.salt);
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
        userModel = model('User', getSchema());
    }
    return userModel;
}

function newUser(data) {
    var _usermodel = getModel();
    var user = new _usermodel(data);
    return user;
}


module.exports = model('User', UserSchema);
module.exports.getModel = getModel;
module.exports.newUser = newUser;