const express = require('express');
const db = require('../database');
const navbar = require('../config/navbar.json');
const middlewares = require('./middlewares');
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

const home = (req, res, find, sort, tag) => {

    let params = {
        home: true,
        title: 'Artículos'
    };

    const getDate = (date) => {
        const numFormat = (num) => {
            let sn = num.toString();
            if (num < 10)
                sn = '0' + sn;
            return sn;
        };

        return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${numFormat(date.getHours())}:${numFormat(date.getMinutes())}`
    };

    db.getArticles(find, sort, tag)
        .then((articles) => {
            params.current = 'articles';
            params.articles = articles;
            params.articles.forEach((article) => {
                article.dateString = getDate(article.date);
            });
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
}

app.get('/', (req, res) => { home(req, res); });

app.get('/articles', (req, res) => { home(req, res); });

app.get('/articles/:tag', (req, res) => {
    home(req, res, null, null, req.params.tag);
});

app.get('/article/:title', (req, res) => {

    const title = req.params.title;

    let params = { title };

    db.getArticle(title)
        .then((article) => {
            params.current = 'articleViewer';
            params.article = {
                title: article.title,
                tags: article.tags.map(tag => tag.name).join(','),
                thumbnail: article.thumbnail,
                background: article.background,
                content: JSON.stringify(article.content)
            };
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.get('/article', middlewares.verifyToken, (req, res) => {
    res.render('articleEditor', getParams({ title: 'New article', action: '/article' }));
    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
});

app.post('/article', middlewares.verifyToken, (req, res) => {
    db.postArticle(req.body)
        .then((article) => {
            res.redirect(`/article/${article.title}`);
            logger.info(`${req.ip} has been created the new article ${article.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Post article' });
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} failed creating new article.`);
        });
});

app.get('/article/:title/edit', middlewares.verifyToken, (req, res) => {
    const title = req.params.title;

    let params = { title: `Edit ${title}` };

    db.getArticle(title)
        .then((article) => {
            params.current = 'articleEditor';
            params.action = `/article/${title}`;
            params.article = {
                title: article.title,
                tags: article.tags.map(tag => tag.name).join(','),
                thumbnail: article.thumbnail,
                background: article.background,
                content: JSON.stringify(article.content)
            };
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.post('/article/:title', middlewares.verifyToken, (req, res) => {
    db.updateArticle(req.params.title, req.body)
        .then((article) => {
            res.redirect(`/article/${article.title}`);
            logger.info(`${req.ip} has been updated the article ${article.title}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Post article' });
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} failed updating the article ${req.params.title}.`);
        });
});

module.exports = app;