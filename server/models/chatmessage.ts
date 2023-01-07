import {Schema, model} from 'mongoose'

const ChatMessageSchema = new Schema({
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

var chatmessageModel: any;

function getModel() {
    if (!chatmessageModel) {
        chatmessageModel = model('ChatMessage', getSchema());
    }
    return chatmessageModel;
}

function newChatMessage(data: any) {
    var _chatmessagemodel = getModel();
    var chatmessage = new _chatmessagemodel(data);
    chatmessage.timestamp = new Date()
    return chatmessage;
}

export default model('ChatMessage', ChatMessageSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newChatMessage = newChatMessage;