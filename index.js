const express = require('express');
const app = express();

const port = 8080;

app.get('/', function(req, res) {
    res.send('CONTENT');
});

app.listen(port, function() {
    console.log(`Listening port ${port}!`);
});