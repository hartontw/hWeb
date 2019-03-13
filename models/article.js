const mongoose = require('mongoose');

let articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    background: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    date: {
        type: Date,
        default: Date.now
    },
    content: JSON,
});

module.exports = mongoose.model('Article', articleSchema);