const express = require('express');
const hbs = require(__dirname + '/../hbs');
const db = require(__dirname + '/../database');
const navbar = require(__dirname + '/../config/navbar.json');
const middlewares = require(__dirname + '/../middlewares');

const app = express();

const getParams = (params) => {
    params.navItems = navbar.items;
    params.styles = navbar.styles;
    params.scripts = navbar.scripts;
    return params;
}

const getError = (error, params) => {
    params.current = 'error';
    params.code = error.code || error.name;
    params.message = error.message;
    return params;
}

app.get('/colaborator', middlewares.verifyToken, (req, res) => {
    res.render(hbs.getView('colaboratorEditor'), getParams({ title: 'New colaborator', action: '/colaborator' }));
});

app.post('/colaborator', middlewares.verifyToken, (req, res) => {
    db.postColaborator(req.body)
        .then((colaborator) => { res.redirect('/admin'); })
        .catch((error) => {
            const params = getError(error, { title: 'Post colaborator' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/colaborator/:name', middlewares.verifyToken, (req, res) => {
    const name = req.params.name;

    let params = { title: `Edit ${name}` };

    db.getColaborator(name)
        .then((colaborator) => {
            params.current = 'colaboratorEditor';
            params.action = `/colaborator/${name}`;
            params.colaborator = colaborator;
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.post('/colaborator/:name', middlewares.verifyToken, (req, res) => {
    db.updateColaborator(req.params.name, req.body)
        .then((colaborator) => { res.redirect('/admin'); })
        .catch((error) => {
            const params = getError(error, { title: 'Update colaborator' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

module.exports = app;