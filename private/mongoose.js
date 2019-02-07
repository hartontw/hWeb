const mongoose = require('mongoose');

const connection_string = `mongodb://${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

const connection_options = (user) => {
    if (user)
        return {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            useNewUrlParser: true
        };

    return { useNewUrlParser: true };
};

mongoose.connect(connection_string, connection_options(true), (err, res) => {
    if (err)
        console.error(`Mongoose: ${err.message}`);
    else
        console.log('Mongoose: Connected');
});

module.exports = mongoose;