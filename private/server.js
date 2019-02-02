require('./config/environment.js');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('./hbs.js');
const navbar = require('./config/navbar.json');
const env = process.env;

let lastAttempt = new Date().getTime();
let penalty = 0;

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'hbs');

const getNavbar = () => {
    const items = navbar.items;
    items.forEach(item => {
        const ref = item.home && '/' || '/' + item.ref;
        const params = {
            items,
            current: item.ref,
            section: item.name
        };
        app.get(ref, (req, res) => {
            res.render(hbs.getView(item.ref), params);
        });
    });
};

getNavbar();

const verifyToken = (req, res, next) => {
    const token = req.cookies[env.TOKEN_COOKIE];
    jwt.verify(token, env.TOKEN_SEED, (err, decoded) => {
        if (err) {
            res.redirect('/login');
        } else {
            req.user = decoded.user;
            next();
        }
    });
}

app.get('/admin', verifyToken, (req, res) => {
    const params = {
        items: navbar.items,
        section: "Admin"
    };
    res.render(hbs.getView('admin'), params);
});

app.get('/login', (req, res) => {
    const params = {
        items: navbar.items,
        section: "Login",
        styles: ["assets/css/signin.css"]
    };
    res.render(hbs.getView('login'), params);
});

app.get('/logout', (req, res) => {
    res.clearCookie(process.env.TOKEN_COOKIE);
    res.redirect('/');
});

app.post('/signin', (req, res) => {
    const now = new Date().getTime();
    if (now - lastAttempt > penalty && req.body.password === process.env.PASS) {
        penalty = 0;
        const token = jwt.sign({ user: env.TOKEN_USER }, env.TOKEN_SEED, { expiresIn: env.TOKEN_EXPIRATION });
        res.cookie(env.TOKEN_COOKIE, token);
        res.redirect('/admin');
    } else {
        penalty += env.TOKEN_PENALTY;
        console.warn(`Someone is trying to login: ${penalty}`);
        res.redirect('/');
    }
    lastAttempt = now;
});

module.exports = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Listening port ${env.PORT}!`);
});