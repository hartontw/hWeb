require('./config/environment');

const express = require('express');
const db = require('./database');
const hbs = require('./hbs');

const app = express();

app.use(require('./routes/index'));
app.set('view engine', 'hbs');

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Listening port ${process.env.PORT}!`);

    db.connect()
        .then(() => { console.log("Connected to Database."); })
        .catch((err) => { console.error(err.message); })
});

function handle(signal) {
    console.log(`Received ${signal}`);

    db.disconnect()
        .then(() => { console.log("Disconnected from Database."); })
        .catch((err) => { console.error(err.message); })
        .finally(() => {
            console.log("Leaving...");
            process.exit();
        });
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGUSR2', handle);
process.on('exit', handle);