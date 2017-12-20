// ./middlewares/db.js
var mongoose = require('mongoose');
const PipelineSchema = require('../models/Pipeline')
const IssueSchema = require('../models/Issue')

module.exports = {
    // Connect/Disconnect middleware
    connectDisconnect: (req, res, next) => {
        // Create connection using Mongo Lab URL
        // available in Webtask context
        mongoose.Promise = global.Promise;
        const connection = mongoose.createConnection(req.webtaskContext.secrets.MONGO_CONNECTIONSTRING, { useMongoClient: true } );
        // Create a mongoose model using the Schema
        req.pipelineModel = connection.model('Pipeline', PipelineSchema);
        req.issueModel = connection.model('Issue', IssueSchema);
        req.on('end', () => {
            // Disconnect when request
            // processing is completed
            mongoose.connection.close();
        })
        // Call next to move to
        // the next Express middleware
        next()
    },
}