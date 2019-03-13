const mongoose = require('mongoose');

let companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    website: String
});

module.exports = mongoose.model('Company', companySchema);