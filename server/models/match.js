"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var MatchSchema = new mongoose_1.Schema({
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
});
function getSchema() {
    return MatchSchema;
}
var matchModel;
function getModel() {
    if (!matchModel) {
        matchModel = (0, mongoose_1.model)('Match', getSchema());
    }
    return matchModel;
}
function newMatch(data) {
    var _matchmodel = getModel();
    var match = new _matchmodel(data);
    match.timestamp = new Date();
    return match;
}
module.exports = (0, mongoose_1.model)('Match', MatchSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newMatch = newMatch;
