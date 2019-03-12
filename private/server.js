require('./config/environment');

const express = require('express');
const db = require('./database');
const logger = require('./logger');
const favicon = require('serve-favicon')

const app = express();

app.use(favicon('./public/assets/favicon.ico'));
app.use(require('./routes/index'));
app.set('view engine', 'hbs');

app.listen(process.env.PORT, '0.0.0.0', () => {
    logger.info(`Listening port ${process.env.PORT}!`);

    db.connect()
        .then(() => { logger.info("Connected to Database."); })
        .catch((err) => { logger.error(err.message, err); })
});

function handle(signal) {
    logger.info(`Received ${signal}`);

    db.disconnect()
        .then(() => { logger.info("Disconnected from Database."); })
        .catch((err) => { logger.error(err.message, err); })
        .finally(() => {
            logger.info("Leaving...");
            process.exit();
        });
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGUSR2', handle);
process.on('exit', handle);