const express = require('express');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');

const app = express();

app.get('/apps', (req, res) => {
    const params = {
        title: 'Aplicaciones',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };
    res.render(hbs.getView('apps'), params);
});

module.exports = app;