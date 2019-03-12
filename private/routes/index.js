const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const navbar = require(__dirname + '/../config/navbar.json');
const logger = require('../logger');

const app = express();

app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser());
app.use(fileUpload());

app.use(express.static(process.env.ROOT + '/public'));
app.use('/assets', express.static(process.env.ROOT + '/node_modules/bootstrap/dist/'));
app.use('/assets/js', [express.static(process.env.ROOT + '/node_modules/jquery/dist/'),
    express.static(process.env.ROOT + '/node_modules/popper.js/dist/')
]);

app.use(require('./login'));
app.use(require('./articles'));
app.use(require('./projects'));
app.use(require('./apps'));
app.use(require('./contact'));
app.use(require('./companies'));
app.use(require('./colaborators'));

app.get('/*', (req, res) => {
    const params = {
        title: '404',
        code: 404,
        message: 'The page you are looking for was not found.',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };

    res.render(process.env.ROOT + '/private/views/error.hbs', params);

    if (!req.originalUrl.includes('/favicon.ico') && !req.originalUrl.includes('/assets'))
        logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl}.`);
});

module.exports = app;