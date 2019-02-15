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

app.get('/projects', (req, res) => {

    let params = { title: 'Proyectos' };

    db.getProjects()
        .then((projects) => {
            params.current = 'projects';

            const years = [...new Set(projects.map(p => p.date.getFullYear()))].reverse();
            params.years = [];
            years.forEach((year) => {
                params.years.push({
                    year,
                    projects: projects.filter(p => p.date.getFullYear() === year).reverse()
                });
            });

            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const formatDate = (date) => {
                return `${months[date.getMonth()]} ${date.getFullYear()}`;
            };

            let side = false;
            params.years.forEach((year) => {
                year.projects.forEach((project) => {
                    project.description = project.description.length > 128 ? `${project.description.substring(0, 125)}...` : project.description;
                    project.dateString = formatDate(project.date);
                    project.classA = side ? 'center-right' : 'center-left';
                    project.classB = side ? 'offset-sm-6 col-sm-6' : 'col-sm-6';
                    project.classC = side ? 'offset-sm-1 col-sm-11' : 'col-sm-11';
                    project.classD = side ? 'debits anim animate fadeInRight' : 'credits anim animate fadeInLeft';
                    side = !side;
                });
            });
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/project/:name', (req, res) => {
    const name = req.params.name;

    let params = { title: name };

    db.getProject(name)
        .then((project) => {
            params.current = 'projectViewer';
            params.project = project;
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/project', middlewares.verifyToken, (req, res) => {
    res.render(hbs.getView('projectEditor'), getParams({ title: 'New project', action: '/project' }));
});

app.post('/project', middlewares.verifyToken, (req, res) => {
    db.postProject(req.body)
        .then((project) => { res.redirect(`/project/${project.name}`); })
        .catch((error) => {
            const params = getError(error, { title: 'Post project' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.get('/project/:name/edit', middlewares.verifyToken, (req, res) => {
    const name = req.params.name;

    let params = { title: `Edit ${name}` };

    db.getProject(name)
        .then((project) => {
            params.current = 'projectEditor';
            params.action = `/project/${name}`;
            const tags = [];
            project.tags.forEach((tag) => { tags.push(tag.name); });
            params.project = {
                name: project.name,
                position: project.position,
                date: project.date.toISOString().substring(0, 10),
                tags: tags.join(','),
                thumbnail: project.thumbnail,
                video: project.video,
                description: project.description
            }
        })
        .catch((error) => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(hbs.getView(params.current), getParams(params));
        });
});

app.post('/project/:name', middlewares.verifyToken, (req, res) => {
    db.updateProject(req.params.name, req.body)
        .then((project) => { res.redirect(`/project/${project.name}`); })
        .catch((error) => {
            const params = getError(error, { title: 'Post project' });
            res.render(hbs.getView(params.current), getParams(params));
        });
});

module.exports = app;