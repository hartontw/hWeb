const mongoose = require('mongoose');

let tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    entries: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Tag', tagSchema);