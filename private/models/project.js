const mongoose = require('mongoose');
const Tag = require('./tag');
const Image = require('./image');
const Company = require('./company');
const Colaborator = require('./colaborator');

const link = mongoose.Schema({ name: String, url: String });
const colaborator = mongoose.Schema({ reference: Colaborator.schema, roles: [String] });

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
    thumbnail: Image.schema,
    video: String,
    company: Company.schema,
    colaborators: [colaborator],
    links: [link]
});

module.exports = mongoose.model('Project', projectSchema);