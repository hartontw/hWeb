const Buffer = require('buffer').Buffer;
const express = require('express');
const hbs = require(__dirname + '/../hbs');
const navbar = require(__dirname + '/../config/navbar.json');
const projects = require(__dirname + '/../config/projects.json');
const mongoose = require('mongoose');

const Article = require(process.env.ROOT + '/private/models/article');
const Tag = require(process.env.ROOT + '/private/models/tag');

const app = express();

const getNavbar = () => {
    const items = navbar.items;
    items.forEach(item => {
        const params = {
            items,
            current: item.ref,
            name: item.name,
            styles: [
                '/assets/css/bootstrap.min.css'
            ],
            scripts: [
                '/assets/js/jquery.min.js',
                '/assets/js/umd/popper.min.js',
                '/assets/js/bootstrap.min.js'
            ]
        };
        if (item.home) {
            Article.find({}, (err, articles) => {
                params.articles = [];
                if (!err) {
                    articles.forEach((article) => {
                        params.articles.push({
                            title: article.title,
                            thumbnail: 'data:' + article.thumbnail.contentType + ';base64,' + Buffer.from(article.thumbnail.data, 'binary').toString('base64'),
                            content: article.content,
                            date: article.date
                        });
                    });
                }
            });
            app.get('/', (req, res) => {
                res.render(hbs.getView(item.ref), params);
            });
        }

        if (item.ref === 'projects') {
            let side = false;
            projects.years.reverse();
            projects.years.forEach((year) => {
                year.months.reverse();
                year.months.forEach((month) => {
                    month.projects.reverse();
                    month.projects.forEach((project) => {
                        project.classA = side ? 'center-right' : 'center-left';
                        project.classB = side ? 'offset-sm-6 col-sm-6' : 'col-sm-6';
                        project.classC = side ? 'offset-sm-1 col-sm-11' : 'col-sm-11';
                        project.classD = side ? 'debits anim animate fadeInRight' : 'credits anim animate fadeInLeft';
                        side = !side;
                    });
                });
            });

            console.log(projects.years[0].months[0].projects[0].side);
            params.years = projects.years;
        }
        app.get('/' + item.ref, (req, res) => {
            res.render(hbs.getView(item.ref), params);
        });
    });
};

getNavbar();

module.exports = app;