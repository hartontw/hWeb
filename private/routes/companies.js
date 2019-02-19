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

app.get('/company', middlewares.verifyToken, (req, res) => {
    res.render(hbs.getView('companyEditor'), getParams({ title: 'New company', action: '/company' }));
});

app.post('/company', middlewares.verifyToken, (req, res) => {
    db.postCompany(req.body)
        .then((company) => { res.redirect('/admin'); })
        .catch((error) => {
            const params = getError(error, { title: 'Post company' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/company/:name', middlewares.verifyToken, (req, res) => {
    const name = req.params.name;

    let params = { title: `Edit ${name}` };

    db.getCompany(name)
        .then((company) => {
            params.current = 'companyEditor';
            params.action = `/company/${name}`;
            params.company = company;
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.post('/company/:name', middlewares.verifyToken, (req, res) => {
    db.updateCompany(req.params.name, req.body)
        .then((company) => { res.redirect('/admin'); })
        .catch((error) => {
            const params = getError(error, { title: 'Update company' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

module.exports = app;