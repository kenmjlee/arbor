// ./models/issue.js
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    githubIssueID: String,
    pipelineID: String,
    created_at: Date,
    updated_at: Date,
    id: mongoose.Schema.ObjectId
})