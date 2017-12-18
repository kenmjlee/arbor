// ./models/issue.js
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    githubIssueID: String,
    pipelineName: String,
    createdAt: Date,
    updatedAt: Date,
    id: mongoose.Schema.ObjectId
})