const express = require('express');
const mongoose = require('mongoose');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');

const Article = require(process.env.ROOT + '/private/models/article');
const Tag = require(process.env.ROOT + '/private/models/tag');

const app = express();

app.get('/articles/:title/', (req, res) => {

    const params = {
        items: navbar.items,
        name: 'Article View',
        styles: [
            '/../assets/css/bootstrap.min.css',
            '//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css',
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/monokai-sublime.min.css',
            '//cdn.quilljs.com/1.3.6/quill.snow.css'
        ],
        scripts: [
            '/../assets/js/jquery.min.js',
            '/../assets/js/umd/popper.min.js',
            '/../assets/js/bootstrap.min.js',
            '//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js',
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js',
            '//cdn.quilljs.com/1.3.6/quill.min.js'
        ]
    };

    Article.findOne({ title: req.params.title }, (err, article) => {
        if (!err) {
            if (article) {
                let background = 'https://writology.com/userdata/faq/write.jpg';
                params.background = background;
                params.title = article.title;
                params.date = article.date;
                params.thumbnail = 'data:' + article.thumbnail.contentType + ';base64,' + Buffer.from(article.thumbnail.data, 'binary').toString('base64');
                params.content = JSON.stringify(article.content);
                res.render(hbs.getView('articleViewer'), params);
            }
        }
    });
});

module.exports = app;