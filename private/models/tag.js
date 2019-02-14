const mongoose = require('mongoose');

let tagSchema = new mongoose.Schema({
    name: {
        type: String,
        //unique: true,
        required: true
    },
    articleEntries: {
        type: Number,
        default: 0
    },
    projectEntries: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Tag', tagSchema);