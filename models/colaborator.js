const mongoose = require('mongoose');

const link = mongoose.Schema({ name: String, url: String, image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' } });

let colaboratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    links: [link]
});

module.exports = mongoose.model('Colaborator', colaboratorSchema);