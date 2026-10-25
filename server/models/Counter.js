const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  foodSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodSpot',
    required: true,
    index: true
  },
  foodSpotSlug: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  cuisine: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

counterSchema.index({ foodSpot: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
