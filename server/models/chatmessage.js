"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var ChatMessageSchema = new mongoose_1.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    text_content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});
function getSchema() {
    return ChatMessageSchema;
}
var chatmessageModel;
function getModel() {
    if (!chatmessageModel) {
        chatmessageModel = (0, mongoose_1.model)('ChatMessage', getSchema());
    }
    return chatmessageModel;
}
function newChatMessage(data) {
    var _chatmessagemodel = getModel();
    var chatmessage = new _chatmessagemodel(data);
    chatmessage.timestamp = new Date();
    return chatmessage;
}
module.exports = (0, mongoose_1.model)('ChatMessage', ChatMessageSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newChatMessage = newChatMessage;
