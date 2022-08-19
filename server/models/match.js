const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    identifier: { 
        type: String // Player1 is the username that alphabetically comes first bewteen the two.
    },
    player1: {
        type: String
    },
    player2: {
        type: String
    },
    winner: {
        type: String
    },
    timestamp: {
        type: Date
    }
})

function getSchema() { 
    return MatchSchema; 
}

var matchModel;

function getModel() {
    if (!matchModel) {
        matchModel = mongoose.model('Match', getSchema());
    }
    return matchModel;
}

function newMatch(data) {
    var _matchmodel = getModel();
    var match = new _matchmodel(data);
    match.timestamp = new Date()
    return match;
}

module.exports = mongoose.model('Match', MatchSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newMatch = newMatch;