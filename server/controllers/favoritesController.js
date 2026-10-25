const dataStore = require('../services/dataStore');

async function getFavorites(req, res, next) {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : (req.query.userId || 'guest_student');
    const favorites = await dataStore.getUserFavorites(userId);
    return res.json({
      success: true,
      total: favorites.length,
      favorites
    });
  } catch (error) {
    next(error);
  }
}

async function addFavorite(req, res, next) {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : (req.body.userId || 'guest_student');
    const { foodSpotId, menuItemId } = req.body;

    if (!foodSpotId) {
      return res.status(400).json({
        success: false,
        message: 'foodSpotId is required to save a favorite.'
      });
    }

    const result = await dataStore.addFavorite(userId, foodSpotId, menuItemId || null);
    return res.status(201).json({
      success: true,
      message: 'Added to favorites!',
      favorite: result
    });
  } catch (error) {
    next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : (req.query.userId || 'guest_student');
    const { id } = req.params;

    await dataStore.removeFavorite(userId, id);
    return res.json({
      success: true,
      message: 'Removed from favorites.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
