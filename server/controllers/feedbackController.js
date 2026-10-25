const dataStore = require('../services/dataStore');

async function getFeedback(req, res, next) {
  try {
    const { foodSpotId } = req.query;
    const feedbackList = await dataStore.getFeedback(foodSpotId);
    return res.json({
      success: true,
      total: feedbackList.length,
      feedback: feedbackList
    });
  } catch (error) {
    next(error);
  }
}

async function addFeedback(req, res, next) {
  try {
    const { foodSpotId, menuItemId, menuItemName, rating, feedbackText, comment, authorName } = req.body;

    if (!foodSpotId) {
      return res.status(400).json({
        success: false,
        message: 'foodSpotId is required to submit feedback.'
      });
    }

    const userId = req.session && req.session.user ? req.session.user.id : null;
    const userName = (req.session && req.session.user ? req.session.user.name : null) || authorName || 'Anonymous Student';

    const result = await dataStore.addFeedback({
      userId,
      userName,
      foodSpotId,
      menuItemId: menuItemId || null,
      menuItemName: menuItemName || null,
      rating: parseInt(rating || 5, 10),
      feedbackText: feedbackText || comment || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you for helping fellow VITians.',
      feedback: result
    });
  } catch (error) {
    next(error);
  }
}

async function getStudentFavourites(req, res, next) {
  try {
    const favourites = await dataStore.getStudentFavourites();
    return res.json({
      success: true,
      total: favourites.length,
      favourites
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFeedback,
  addFeedback,
  getStudentFavourites
};
