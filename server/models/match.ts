import {Schema, model} from 'mongoose'

const MatchSchema = new Schema({
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

var matchModel: any;

function getModel() {
    if (!matchModel) {
        matchModel = model('Match', getSchema());
    }
    return matchModel;
}

function newMatch(data: any) {
    var _matchmodel = getModel();
    var match = new _matchmodel(data);
    match.timestamp = new Date()
    return match;
}

export default model('Match', MatchSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newMatch = newMatch;