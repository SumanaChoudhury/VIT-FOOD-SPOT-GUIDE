const dataStore = require('../services/dataStore');
const { validateRecommendationInput } = require('../validators/inputValidators');
const { appEvents } = require('../utils/eventEmitter');

async function getRecommendations(req, res, next) {
  try {
    const { category, foodSpot } = req.query;
    let recs = await dataStore.getRecommendations('approved');

    if (category) {
      recs = recs.filter(r => r.category && r.category.toLowerCase() === category.toLowerCase());
    }
    if (foodSpot) {
      recs = recs.filter(r => String(r.foodSpot) === String(foodSpot) || (r.foodSpotName && r.foodSpotName.toLowerCase().includes(foodSpot.toLowerCase())));
    }

    res.json({
      success: true,
      count: recs.length,
      data: recs
    });
  } catch (err) {
    next(err);
  }
}

async function createRecommendation(req, res, next) {
  try {
    const validation = validateRecommendationInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const { foodSpot, dishName, category, text, displayName, anonymous } = req.body;

    const targetSpot = await dataStore.getFoodSpotByIdOrSlug(foodSpot);
    const spotName = targetSpot ? targetSpot.name : foodSpot;
    const spotId = targetSpot ? targetSpot.id : foodSpot;

    const newRec = await dataStore.addRecommendation({
      foodSpot: spotId,
      foodSpotName: spotName,
      dishName: dishName ? dishName.trim() : 'Special Dish',
      category: category || 'Student Pick',
      recommendedReason: text ? text.trim() : '',
      authorName: anonymous ? 'Anonymous Student' : (displayName ? displayName.trim() : 'VIT Student'),
      anonymous: Boolean(anonymous)
    });

    // Trigger Node.js event
    appEvents.emit('recommendationSubmitted', {
      id: newRec._id,
      spotName,
      dishName: newRec.dishName,
      displayName: newRec.authorName
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your recommendation has been submitted for student moderation.',
      data: newRec
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRecommendations,
  createRecommendation
};
