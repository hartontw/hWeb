const mongoose = require('mongoose');

const Image = require('./image');

let companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: Image.schema,
    website: String
});

module.exports = mongoose.model('Company', companySchema);