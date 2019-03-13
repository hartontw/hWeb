const express = require('express');
const path = require('path');
const navbar = require(path.join(__dirname, '/../config/navbar.json'));
const logger = require(path.join(__dirname, '../logger'));

const app = express();

app.get('/apps', (req, res) => {
    const params = {
        title: 'Aplicaciones',
        current: 'apps',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };

    res.render(params.current, params);

    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
});

module.exports = app;