const mongoose = require('mongoose');
const Tag = require('./tag');
const Image = require('./image');

let articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    tags: [Tag.schema],
    thumbnail: Image.schema,
    background: Image.schema,
    date: {
        type: Date,
        default: Date.now
    },
    content: JSON,
});

module.exports = mongoose.model('Article', articleSchema);