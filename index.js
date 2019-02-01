const express = require('express');
const app = express();

const port = 3000;

app.get('/', function(req, res) {
    res.send('CONTENT');
});

app.listen(port, '0.0.0.0', function() {
    console.log(`Listening port ${port}!`);
});