const mongoose = require('mongoose');

const foodSpotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  campusLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampusLocation',
    required: false
  },
  zone: {
    type: String,
    enum: ['Academic Blocks', "Ladies' Hostel", "Boys' Hostel", 'Other Food Spots'],
    default: 'Academic Blocks',
    index: true
  },
  specificLocation: {
    type: String,
    default: ''
  },
  categories: [{
    type: String,
    trim: true,
    index: true
  }],
  description: {
    type: String,
    default: ''
  },
  menuStatus: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
  isCounterBased: {
    type: Boolean,
    default: false
  },
  sharedMenuId: {
    type: String,
    default: null,
    index: true
  },
  mustTryItem: {
    type: String,
    default: ''
  },
  recommendedBy: {
    type: String,
    default: 'Our pick'
  },
  openingHours: {
    type: String,
    default: 'Campus hours (standard academic/hostel timings)'
  }
}, {
  timestamps: true
});

foodSpotSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.models.FoodSpot || mongoose.model('FoodSpot', foodSpotSchema);
