const express = require('express');
const app = express();

app.use(express.static(process.env.ROOT + '/public'));
app.use('/assets', express.static(process.env.ROOT + '/node_modules/bootstrap/dist/'));
app.use('/assets/js', [express.static(process.env.ROOT + '/node_modules/jquery/dist/'),
    express.static(process.env.ROOT + '/node_modules/popper.js/dist/')
]);

app.use(require('./navbar'));
app.use(require('./admin'));
app.use(require('./articles'));

module.exports = app;