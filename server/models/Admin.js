const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator'],
    default: 'admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
