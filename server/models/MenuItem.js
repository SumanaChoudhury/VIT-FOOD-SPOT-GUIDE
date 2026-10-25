const mongoose = require('mongoose');

const priceVariantSchema = new mongoose.Schema({
  variant: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  normalizedName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
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
  counter: {
    type: String,
    default: null,
    index: true
  },
  counterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counter',
    default: null
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
  price: {
    type: Number,
    default: null,
    index: true
  },
  priceVariants: [priceVariantSchema],
  foodClassification: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'unclassified'],
    default: 'unclassified',
    index: true
  },
  classificationSource: {
    type: String,
    enum: ['explicit', 'inferred', 'unknown'],
    default: 'unknown'
  },
  isMustTry: {
    type: Boolean,
    default: false,
    index: true
  },
  recommendedBy: {
    type: String,
    default: ''
  },
  sourceFile: {
    type: String,
    default: ''
  },
  importedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

menuItemSchema.index({ normalizedName: 'text', description: 'text' });
menuItemSchema.index({ foodSpot: 1, price: 1 });
menuItemSchema.index({ foodSpot: 1, categories: 1 });

module.exports = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
