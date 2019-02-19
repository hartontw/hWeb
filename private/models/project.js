const mongoose = require('mongoose');

const link = mongoose.Schema({ name: String, url: String });
const colaborator = mongoose.Schema({ reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Colaborator' }, roles: [String] });

let projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    roles: [String],
    date: Date,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    description: String,
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    video: String,
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    colaborators: [colaborator],
    links: [link]
});

module.exports = mongoose.model('Project', projectSchema);