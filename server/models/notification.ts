import {Schema, model} from 'mongoose'

const NotificationSchema = new Schema({
    user: {
        type: String,
    },
    from: {
        type: String,
    },
    notification_type: {
        type: String,        
    },
    text_content: {
        type: String,
    },
    timestamp: {
        type: Date,
    }
})

function getSchema() { 
    return NotificationSchema; 
}

var notificationModel;

function getModel() {
    if (!notificationModel) {
        notificationModel = model('Notification', getSchema());
    }
    return notificationModel;
}

function newNotification(data) {
    var _notificationModel = getModel();
    var notification = new _notificationModel(data);
    notification.timestamp = new Date()
    return notification;
}

module.exports = model('Notification', NotificationSchema);
module.exports.getSchema = getSchema;
module.exports.getModel = getModel;
module.exports.newNotification = newNotification;