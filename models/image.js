const mongoose = require('mongoose');

let imageSchema = new mongoose.Schema({
    url: {
        type: String,
        //unique: true,
        required: true
    }
});

module.exports = mongoose.model('Image', imageSchema);