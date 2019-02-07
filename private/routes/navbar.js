const express = require('express');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');

const app = express();

const getNavbar = () => {
    const items = navbar.items;
    items.forEach(item => {
        const params = {
            items,
            current: item.ref,
            name: item.name,
            styles: [
                '/assets/css/bootstrap.min.css'
            ],
            scripts: [
                '/assets/js/jquery.min.js',
                '/assets/js/umd/popper.min.js',
                '/assets/js/bootstrap.min.js'
            ]
        };
        if (item.home) {
            app.get('/', (req, res) => {
                res.render(hbs.getView(item.ref), params);
            });
        }
        app.get('/' + item.ref, (req, res) => {
            res.render(hbs.getView(item.ref), params);
        });
    });
};

getNavbar();

module.exports = app;