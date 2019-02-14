const mongoose = require('mongoose');
const Tag = require('./tag');
const Colaborator = require('./colaborator');

const link = mongoose.Schema({ street: String, city: String });

let projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    position: {
        type: String,
        required: true,
    },
    date: Date,
    tags: [Tag.schema],
    description: String,
    thumbnail: String,
    video: String,
    //colaborators: [Colaborator.schema],
    //links: [link]
});

module.exports = mongoose.model('Project', projectSchema);