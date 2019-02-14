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

const home = (req, res) => {

    let params = {
        home: true,
        title: 'Artículos'
    };

    db.getArticles()
        .then((articles) => {
            params.current = 'articles';
            params.articles = articles;
            params.articles.forEach((article) => {
                const date = article.date;
                article.dateString = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
            });
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
}

app.get('/', home);

app.get('/articles', home);

app.get('/articles/:title', (req, res) => {

    const title = req.params.title;

    let params = { title };

    db.getArticle(title)
        .then((article) => {
            params.current = 'articleViewer';
            params.article = article;
            params.article.content = JSON.stringify(article.content);
            params.article.background = article.background || 'https://writology.com/userdata/faq/write.jpg';
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/article', middlewares.verifyToken, (req, res) => {
    res.render(hbs.getView('articleEditor'), getParams({ title: 'New article', action: '/article' }));
});

app.post('/article', middlewares.verifyToken, (req, res) => {
    db.postArticle(req.body.title, req.body.tags, req.body.thumbnail, req.body.background, req.body.content)
        .then((article) => { res.redirect(`/articles/${article.title}`); })
        .catch((error) => {
            const params = getError(error, { title: 'Post article' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/articles/:title/edit', middlewares.verifyToken, (req, res) => {
    const title = req.params.title;

    let params = { title: `Edit ${title}` };

    db.getArticle(title)
        .then((article) => {
            params.current = 'articleEditor';
            params.action = `/articles/${title}`;
            params.article = article;
            const tags = [];
            article.tags.forEach((tag) => { tags.push(tag.name); });
            params.article.tags = tags;
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.post('/articles/:title', middlewares.verifyToken, (req, res) => {
    db.updateProject(req.params.title, req.body.title, req.body.tags, req.body.thumbnail, req.body.background, req.body.content)
        .then((article) => { res.redirect(`/articles/${article.name}`); })
        .catch((error) => {
            const params = getError(error, { title: 'Post article' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

module.exports = app;