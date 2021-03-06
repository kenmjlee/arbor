// ./index.js
var Express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser')
var app = Express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('./middlewares/db').connectDisconnect);

require('./routes/board')(app);
require('./routes/issues')(app);
require('./routes/milestones')(app);

module.exports = Webtask.fromExpress(app);