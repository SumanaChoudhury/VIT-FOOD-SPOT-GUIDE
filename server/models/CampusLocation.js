const mongoose = require('mongoose');

const campusLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['academic_block', 'hostel', 'library', 'central_hub', 'other'],
    default: 'academic_block'
  },
  parent: {
    type: String,
    default: 'VIT Vellore Campus'
  },
  relationships: [{
    nearbyLocation: {
      type: String,
      required: true
    },
    proximityLevel: {
      type: String,
      enum: ['adjacent', 'close', 'moderate'],
      default: 'close'
    }
  }],
  coordinates: {
    verified: {
      type: Boolean,
      default: false
    },
    note: {
      type: String,
      default: 'Relative campus relationships used. Exact GPS coordinates not fabricated.'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.CampusLocation || mongoose.model('CampusLocation', campusLocationSchema);
