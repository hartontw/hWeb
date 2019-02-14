const mongoose = require('mongoose');

const link = mongoose.Schema({ street: String, city: String });

let colaboratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    //links: [link]
});

module.exports = mongoose.model('Colaborator', colaboratorSchema);