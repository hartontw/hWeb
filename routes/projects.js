const express = require('express');
const path = require('path');
const db = require(path.join(__dirname, '/../database'));
const navbar = require(path.join(__dirname, '/../config/navbar.json'));
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

const projects = (req, res, find, sort, tag) => {
    let params = { title: 'Proyectos' };

    db.getProjects(find, sort, tag)
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
                    project.description = project.description.length > 80 ? `${project.description.substring(0, 77)}...` : project.description;
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
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
};

app.get('/projects', (req, res) => {
    projects(req, res);
});

app.get('/projects/:tag', (req, res) => {
    projects(req, res, null, null, req.params.tag);
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
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.get('/project', middlewares.verifyToken, (req, res) => {
    const params = { title: 'New project' };

    db.getCompanies()
        .then((companies) => {
            params.companies = companies;

            db.getColaborators()
                .then((colaborators) => {
                    params.colaborators = colaborators;

                    params.action = '/project';
                    params.current = 'projectEditor';
                })
                .catch((error) => {
                    params = getError(error, params);
                })
                .finally(() => {
                    res.render(params.current, getParams(params));
                    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
                });
        })
        .catch((error) => {
            params = getError(error, params);
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.post('/project', middlewares.verifyToken, (req, res) => {
    db.postProject(req.body)
        .then((project) => {
            res.redirect(`/project/${project.name}`);
            logger.info(`${req.ip} has been created the new project ${project.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Post project' });
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} failed creating a new project.`);
        });
});

app.get('/project/:name/edit', middlewares.verifyToken, (req, res) => {
    const name = req.params.name;

    let params = { title: `Edit ${name}` };

    db.getProject(name)
        .then((project) => {
            db.getCompanies()
                .then((companies) => {
                    params.companies = companies;

                    db.getColaborators()
                        .then((colaborators) => {
                            params.colaborators = colaborators;

                            params.current = 'projectEditor';
                            params.action = `/project/${name}`;
                            params.project = {
                                name: project.name,
                                roles: project.roles,
                                date: project.date.toISOString().substring(0, 10),
                                tags: project.tags.map(tag => tag.name).join(','),
                                thumbnail: project.thumbnail,
                                video: project.video,
                                description: project.description,
                                company: project.company,
                                colaborators: project.colaborators,
                                links: project.links
                            };
                        })
                        .catch((error) => {
                            params = getError(error, params);
                        })
                        .finally(() => {
                            res.render(params.current, getParams(params));
                            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
                        });
                })
                .catch((error) => {
                    params = getError(error, params);
                    res.render(params.current, getParams(params));
                    logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
                });
        })
        .catch((error) => {
            params = getError(error, params);
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.post('/project/:name', middlewares.verifyToken, (req, res) => {
    db.updateProject(req.params.name, req.body)
        .then((project) => {
            res.redirect(`/project/${project.name}`);
            logger.info(`${req.ip} has been updated project ${project.name}.`);
        })
        .catch((error) => {
            const params = getError(error, { title: 'Update project' });
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} fails to update project ${req.params.name}.`);
        });
});

module.exports = app;