//models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    saved: {
        type: Array,
        required: true,
    },
}, {collection: 'users'});

module.exports = User = mongoose.model('user', UserSchema);