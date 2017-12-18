// ./models/milestone.js
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    author: String,
    content: String,
    created_at: Date,
    updated_at: Date,
    id: mongoose.Schema.ObjectId
})