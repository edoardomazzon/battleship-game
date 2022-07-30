const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
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
})

function getSchema() { 
    return ChatMessageSchema; 
}


// Mongoose Model
var chatmessageModel; // This is not exposed outside the model

function getModel() {
    if (!chatmessageModel) {
        chatmessageModel = mongoose.model('ChatMessage', getSchema());
    }
    return chatmessageModel;
}



function newChatMessage(data) {
    var _chatmessagemodel = getModel();
    var chatmessage = new _chatmessagemodel(data);
    chatmessage.timestamp = new Date()
    return chatmessage;
}

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newChatMessage = newChatMessage;