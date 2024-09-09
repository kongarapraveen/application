const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    file: { type: String },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
