const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');

const Article = require(process.env.ROOT + '/private/models/article');
const Tag = require(process.env.ROOT + '/private/models/tag');

const env = process.env;
const app = express();

let lastAttempt = new Date().getTime();
let penalty = 0;

app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser());
app.use(fileUpload());

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

/////////////////
// ADMIN PANEL //
/////////////////

app.get('/admin', verifyToken, (req, res) => {
    const params = {
        items: navbar.items,
        name: "Admin",
        styles: [
            '/assets/css/bootstrap.min.css'
        ],
        scripts: [
            '/assets/js/jquery.min.js',
            '/assets/js/umd/popper.min.js',
            '/assets/js/bootstrap.min.js'
        ]
    };
    res.render(hbs.getView('admin'), params);
});

///////////
// LOGIN //
///////////

// LOGIN FORM //
app.get('/login', (req, res) => {
    const params = {
        items: navbar.items,
        name: "Login",
        styles: [
            '/assets/css/bootstrap.min.css'
        ],
        scripts: [
            '/assets/js/jquery.min.js',
            '/assets/js/umd/popper.min.js',
            '/assets/js/bootstrap.min.js'
        ]
    };
    res.render(hbs.getView('login'), params);
});

// LOGIN VALIDATION //
app.post('/login', (req, res) => {
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

// LOG OUT //
app.get('/logout', (req, res) => {
    res.clearCookie(env.TOKEN_COOKIE);
    res.redirect('/');
});

//////////////
// ARTICLES //
//////////////

const styles = [
    '/../assets/css/bootstrap.min.css',
    '//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css',
    '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/monokai-sublime.min.css',
    '//cdn.quilljs.com/1.3.6/quill.snow.css'
];

const scripts = [
    '/../assets/js/jquery.min.js',
    '/../assets/js/umd/popper.min.js',
    '/../assets/js/bootstrap.min.js',
    '//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js',
    '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js',
    '//cdn.quilljs.com/1.3.6/quill.min.js'
]

// NEW ARTICLE //
app.get('/article', verifyToken, (req, res) => {
    const params = {
        items: navbar.items,
        name: 'New Article',
        styles,
        scripts,
        method: 'POST'
    };
    res.render(hbs.getView('articleEditor'), params);
});

// SAVE ARTICLE //
app.post('/article/', verifyToken, (req, res) => {
    const title = req.body.title;
    let tags = [];
    const thumbnail = {
        data: req.files.thumbnail.data,
        contentType: req.files.thumbnail.mimetype
    };
    const content = JSON.parse(req.body.content);

    // req.body.tags.split(',').forEach((tagName) => {
    //     console.log(tagName);
    //     Tag.findOne({ name: tagName }, (err, tag) => {
    //         if (!err) {
    //             if (tag) {
    //                 tag.entries += 1;
    //                 tag.save((err) => {
    //                     if (err) {
    //                         console.log(`Tag ${ tagName} exists (${tag.entries})`);
    //                         throw err;
    //                     }
    //                 });
    //                 tags.push(tag);
    //             } else {
    //                 let newTag = new Tag({ name: tagName });
    //                 newTag.save((err) => {
    //                     if (err) {
    //                         console.log(`Tag ${ tagName} new`);
    //                         throw err;
    //                     }
    //                 });
    //                 tags.push(newTag);
    //             }
    //         }
    //     });
    // });

    let article = new Article({
        title,
        //tags,
        thumbnail,
        content
    });

    article.save((err, article) => {
        if (!err) {
            return res.redirect(`/articles/${article.title}`);
        } else throw err;
    });

});

// EDIT ARTICLE //
app.get('/articles/:title/edit', verifyToken, (req, res) => {
    Article.findOne({ title: req.params.title }, (err, art) => {
        if (!err) {
            let tags = [];
            art.tags.forEach((tag) => {
                tags.push(tag.name);
            });

            const params = {
                items: navbar.items,
                name: 'Article Edit',
                styles,
                scripts,
                article: {
                    title: art.title,
                    tags: tags.join(','),
                    content: art.content
                },
                method: 'PUT'
            };

            res.render(hbs.getView('articleEditor'), params);
        }
    });
});

// UPDATE ARTICLE //
// app.put('/article', verifyToken, (req, res) => {
//     const newTitle = req.body.title.trim();
//     Article.findOne(title: newTitle)
//         .exec();
//     const newTags = req.body.tags.trim().split(',');
//     newTags.forEach((tag) => {

//     });
// });

module.exports = app;