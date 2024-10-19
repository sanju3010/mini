const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define user schema with additional fields
const userSchema = new mongoose.Schema({
    name: { type: String, required: true,unique:true }, // Added name field
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Admin', 'Donor', 'Volunteer', 'Orphanage'] } // Added role field
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Password verification method
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
