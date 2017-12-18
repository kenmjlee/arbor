// ./models/pipeline.js
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    pipelineID: String,
    pipelineName: String,
    createdAt: Date,
    updatedAt: Date,
    id: mongoose.Schema.ObjectId
})