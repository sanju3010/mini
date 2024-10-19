const mongoose = require('mongoose');

const orphanageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    donationHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    }],
    needs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Need'
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child'
    }]
});

module.exports = mongoose.model('Orphanage', orphanageSchema);