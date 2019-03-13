const express = require('express');
const path = require('path');
const db = require(path.join(__dirname, '/../database'));
const navbar = require(path.join(__dirname, '/../config/navbar.json'));
const middlewares = require('./middlewares');
const logger = require(path.join(__dirname, '../logger'));

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
    res.render('companyEditor', getParams({ title: 'New company', action: '/company' }));
    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
});

app.post('/company', middlewares.verifyToken, (req, res) => {
    db.postCompany(req.body)
        .then((company) => {
            res.redirect('/admin');
            logger.info(`${req.ip} has been created the new company ${company.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Post company' });
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} failed creating a new company.`);
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
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.post('/company/:name', middlewares.verifyToken, (req, res) => {
    db.updateCompany(req.params.name, req.body)
        .then((company) => {
            res.redirect('/admin');
            logger.info(`${req.ip} has been updated the company ${company.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Update company' });
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} failed updating the company ${req.params.name}.`);
        });
});

module.exports = app;