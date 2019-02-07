require('./config/environment');

const express = require('express');
const mongoose = require('./mongoose');

const app = express();
app.use(require('./routes/index'));
app.set('view engine', 'hbs');

function handle(signal) {
    console.log(`Received ${signal}`);
    mongoose.connection.close((err) => {
        console.log(err);
    })
    process.exit();
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGUSR2', handle);

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Listening port ${process.env.PORT}!`);
});