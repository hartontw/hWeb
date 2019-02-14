const express = require('express');
const navbar = require(__dirname + '/../config/navbar.json');

const app = express();

app.get('/contact', (req, res) => {
    const params = {
        title: 'Contacto',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };
    res.render(process.env.ROOT + '/private/views/contact.hbs', params);
});

module.exports = app;