const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  foodSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodSpot',
    required: true,
    index: true
  },
  foodSpotName: {
    type: String,
    required: true
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },
  dishName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'Must Try',
      'Best Meal',
      'Best Snack',
      'Best Beverage',
      'Best Dessert',
      'Best Value',
      'Best Quick Bite',
      'Best Vegetarian Option'
    ],
    default: 'Must Try',
    index: true
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  displayName: {
    type: String,
    default: 'Anonymous Student',
    trim: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);
