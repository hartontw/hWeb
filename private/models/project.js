const mongoose = require('mongoose');
const Tag = require('./tag');
const Colaborator = require('./colaborator');

const link = mongoose.Schema({ name: String, url: String });
const colaborator = mongoose.Schema({ name: String, position: String, url: String });

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
    colaborators: [colaborator],
    links: [link]
});

module.exports = mongoose.model('Project', projectSchema);