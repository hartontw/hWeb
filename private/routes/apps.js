const express = require('express');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');
const logger = require('../logger');

const app = express();

app.get('/apps', (req, res) => {
    const params = {
        title: 'Aplicaciones',
        current: 'apps',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };

    res.render(hbs.getView(params.current), params);

    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
});

module.exports = app;