const mongoose = require('mongoose');
const Tag = require('./tag');

let articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    //tags: [Tag.schema],
    date: {
        type: Date,
        default: Date.now
    },
    content: JSON,
});

module.exports = mongoose.model('Article', articleSchema);