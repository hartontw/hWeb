const express = require('express');
const path = require('path');
const https = require('https');
const navbar = require(path.join(__dirname, '/../config/navbar.json'));
const logger = require(path.join(__dirname, '../logger'));
const servers = require('../config/servers.json');
const middlewares = require('./middlewares');
const pm2 = require('pm2');

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

function getNWN() {
    return new Promise((resolve, reject) => {
        https.request('https://api.nwn.beamdog.net/v1/servers/164.132.111.124/5121', res => {
            if (res.statusCode === 200) {
                res.setEncoding('utf8');
                res.on('data', data => {
                    resolve(JSON.parse(data));
                });
            } else reject();
        }).end();
    })
}

function describe(key) {
    return new Promise((resolve, reject) => {
        pm2.describe(key, (err, desc) => {
            const entry = {
                name: key,
                image: servers[key].image,
                description: servers[key].description,
                status: 'inactive',
                color: 'gray'
            }

            if (!err && desc.length > 0) {
                entry.status = desc[0].pm2_env.status;

                if (entry.status === 'online') {
                    entry.color = 'green';
                    if (key === 'nwn') {
                        getNWN()
                            .then(info => {
                                entry.players = info.current_players;
                                entry.maxPlayers = info.max_players;
                            })
                            .catch(err => logger.error(err.message))
                            .finally(() => resolve(entry));
                    } else resolve(entry);
                } else {
                    entry.color = 'red';
                    resolve(entry);
                }
            } else resolve(entry);
        });
    });
}

async function describeAll() {
    return new Promise(async(resolve, reject) => {
        try {
            const list = [];
            const keys = Object.keys(servers);
            for (const key of keys) {
                const entry = await describe(key);
                list.push(entry);
            }
            resolve(list);
        } catch (error) {
            reject(error);
        }
    });
}

app.get('/servers', (req, res) => {

    let params = {
        title: 'Servidores'
    };

    describeAll()
        .then(list => {
            params.current = 'servers';
            params.navItems = navbar.items;
            params.styles = navbar.styles;
            params.scripts = navbar.scripts;
            params.list = list;
        })
        .catch(error => {
            params = getError(error, params);
        })
        .finally(() => {
            res.render(params.current, getParams(params));
            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.get('/servers/:name', middlewares.verifyToken, (req, res) => {
    const key = req.params.name;

    describe(key)
        .then(entry => {
            const params = {
                title: entry.name,
                current: 'serverViewer',
                navItems: navbar.items,
                styles: navbar.styles,
                scripts: navbar.scripts,
                entry
            };

            res.render(params.current, params);

            logger.info(`${req.ip} accesing to ${req.hostname}${req.originalUrl} redirected to ${params.current}.`);
        });
});

app.get('/servers/:name/start', middlewares.verifyToken, (req, res) => {
    const key = req.params.name;
    pm2.start(key, (err, proc) => {
        res.redirect('/servers');
    });
});

app.get('/servers/:name/stop', middlewares.verifyToken, (req, res) => {
    const key = req.params.name;
    pm2.stop(key, (err, proc) => {
        res.redirect('/servers');
    });
});

module.exports = app;