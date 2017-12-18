// author: Chris Nwamba https://scotch.io/@codebeast
// ./middlewares/db.js
var mongoose = require('mongoose');
// import Story schema
const IssueSchema = require('../models/issue')
const PipelineSchema = require('../models/pipeline')

module.exports = {
    // Connect/Disconnect middleware
    connectDisconnect: (req, res, next) => {
        // Create connection using Mongo Lab URL
        // available in Webtask context
        const connection = mongoose.createConnection(req.webtaskContext.secrets.MONGO_CONNECTIONSTRING, { useMongoClient: true } );
        // Create a mongoose model using the Schema
        req.issueModel = connection.model('Issue', IssueSchema);
        req.pipelineModel = connection.model('Pipeline', PipelineSchema);
        
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