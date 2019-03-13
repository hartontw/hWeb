require('./config/environment');

const express = require('express');
const db = require('./database');
const logger = require('./logger');
const favicon = require('serve-favicon')
const path = require('path');
const hbs = require('./config/hbs');

hbs.registerPartials(__dirname + '/views/partials');

const app = express();

app.use(express.static('public'));
app.use('/assets', express.static('node_modules/bootstrap/dist/'));
app.use('/assets/js', [
    express.static('node_modules/jquery/dist/'),
    express.static('node_modules/popper.js/dist/')
]);

app.use(favicon(__dirname + '/public/assets/favicon.ico'));
app.use(require('./routes/index'));
app.set('views', path.join(__dirname, 'views'));
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
            process.exit(0);
        });
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGUSR2', handle);
process.on('exit', handle);