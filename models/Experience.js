//models/Experience.js

const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        zip: {
            type: String, 
            required: true,
        },
        borough: {
            type: String,
            required: true,
        }
    },
    tags: {
        type: Array,
        required: true,
    },
}, {collection: 'nyc'});

module.exports = Experience = mongoose.model('experience', ExperienceSchema);