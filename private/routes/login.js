const express = require('express');
const jwt = require('jsonwebtoken');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');
const middlewares = require(__dirname + '/../middlewares');

const app = express();

let lastAttempt = new Date().getTime();
let penalty = 0;

// ADMIN PANEL //
app.get('/admin', middlewares.verifyToken, (req, res) => {
    const params = {
        title: 'Admin',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };
    res.render(hbs.getView('admin'), params);
});

// LOGIN FORM //
app.get('/login', (req, res) => {
    const params = {
        title: 'Login',
        navItems: navbar.items,
        styles: navbar.styles,
        scripts: navbar.scripts
    };
    res.render(hbs.getView('login'), params);
});

// LOGIN VALIDATION //
app.post('/login', (req, res) => {
    const now = new Date().getTime();
    if (now - lastAttempt > penalty && req.body.password === process.env.PASS) {
        penalty = 0;
        const token = jwt.sign({ user: process.env.TOKEN_USER }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRATION });
        res.cookie(process.env.TOKEN_COOKIE, token);
        res.redirect('/admin');
    } else {
        penalty += process.env.TOKEN_PENALTY;
        console.warn(`Someone is trying to login: ${penalty}`);
        res.redirect('/');
    }
    lastAttempt = now;
});

// LOG OUT //
app.get('/logout', (req, res) => {
    res.clearCookie(process.env.TOKEN_COOKIE);
    res.redirect('/');
});

module.exports = app;