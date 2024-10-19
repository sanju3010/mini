const mongoose = require('mongoose');

const needSchema = new mongoose.Schema({
    orphanageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orphanage' },
    description:{type:String,required:true},
    quantity:{type:Number,required:true},
    status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Need', needSchema);
