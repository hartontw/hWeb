const express = require('express');
const hbs = require(__dirname + '/../hbs');
const db = require(__dirname + '/../database');
const navbar = require(__dirname + '/../config/navbar.json');
const middlewares = require(__dirname + '/../middlewares');
const logger = require('../logger');

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
    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
});

app.post('/colaborator', middlewares.verifyToken, (req, res) => {
    db.postColaborator(req.body)
        .then((colaborator) => {
            res.redirect('/admin');
            logger.info(`${req.ip} has been created the new colaborator ${colaborator.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Post colaborator' });
            res.render(hbs.getView(params.current), getParams(params));
            logger.info(`${req.ip} failed creating new colaborator.`);
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
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.post('/colaborator/:name', middlewares.verifyToken, (req, res) => {
    db.updateColaborator(req.params.name, req.body)
        .then((colaborator) => {
            res.redirect('/admin');
            logger.info(`${req.ip} has been update the colaborator ${colaborator.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Update colaborator' });
            res.render(hbs.getView(params.current), getParams(params));
            logger.info(`${req.ip} failed updating the colaborator ${req.params.name}.`);
        });
});

module.exports = app;