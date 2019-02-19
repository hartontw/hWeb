const express = require('express');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');

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
});

module.exports = app;