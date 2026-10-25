const dataStore = require('../services/dataStore');
const recommendationEngine = require('../services/recommendationEngine');

async function getFoodSpots(req, res, next) {
  try {
    const { zone, location, category, search, group } = req.query;
    let spots = await dataStore.getFoodSpots({ zone, location });

    if (category) {
      spots = spots.filter(s => s.categories && s.categories.some(c => c.toLowerCase() === category.toLowerCase()));
    }
    if (group === 'nescafe') {
      spots = spots.filter(s => s.sharedMenuId === 'nescafe_shared_menu');
    }
    if (search) {
      const q = search.toLowerCase();
      spots = spots.filter(s => (s.name && s.name.toLowerCase().includes(q)) || (s.description && s.description.toLowerCase().includes(q)));
    }

    res.json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (err) {
    next(err);
  }
}

async function getFoodSpotById(req, res, next) {
  try {
    const { id } = req.params;
    const spot = await dataStore.getFoodSpotByIdOrSlug(id);
    if (!spot) {
      return res.status(404).json({ success: false, error: 'Food spot not found' });
    }

    // If OFW, fetch counters
    let counters = [];
    if (spot.isCounterBased) {
      counters = await dataStore.getCounters(spot.slug);
    }

    // Fetch menu items for this spot (or shared Nescafe menu)
    const targetSpotId = (spot.sharedMenuId === 'nescafe_shared_menu') ? 'nescafe-sjt' : spot.id;
    const { items: menuItems } = await dataStore.getMenuItems({ foodSpot: targetSpotId, limit: 1000 });

    // Fetch reviews for this spot
    const feedbackList = await dataStore.getFeedback(spot.id);

    res.json({
      success: true,
      data: {
        ...spot,
        counters,
        menuItems,
        menuItemCount: menuItems.length,
        recommendations: feedbackList
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getNearbyFoodSpots(req, res, next) {
  try {
    const { location, category, maxBudget, dietary, q, limit } = req.query;
    const recommendations = await recommendationEngine.getRecommendations({
      location,
      category,
      maxBudget,
      dietary,
      searchQuery: q,
      limit: limit || 10
    });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (err) {
    next(err);
  }
}

async function getCountersBySpot(req, res, next) {
  try {
    const { id } = req.params;
    const spot = await dataStore.getFoodSpotByIdOrSlug(id);
    if (!spot) {
      return res.status(404).json({ success: false, error: 'Food spot not found' });
    }
    const counters = await dataStore.getCounters(spot.slug);
    res.json({
      success: true,
      count: counters.length,
      data: counters
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFoodSpots,
  getFoodSpotById,
  getNearbyFoodSpots,
  getCountersBySpot
};
