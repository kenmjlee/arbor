// ./models/pipeline.js
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    id: String,
    name: String,
    created_at: Date,
    updated_at: Date,
    id: mongoose.Schema.ObjectId
})