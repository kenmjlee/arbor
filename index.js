// ./index.js
var Express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser')
var app = Express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

require('./routes/github')(app);

module.exports = Webtask.fromExpress(app);