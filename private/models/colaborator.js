const mongoose = require('mongoose');

const Image = require('./image');
const link = mongoose.Schema({ name: String, url: String, image: Image.schema });

let colaboratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    links: [link]
});

module.exports = mongoose.model('Colaborator', colaboratorSchema);