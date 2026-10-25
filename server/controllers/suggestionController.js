const dataStore = require('../services/dataStore');

/**
 * Public endpoint for campus students/visitors to submit menu updates and price changes.
 * Suggestions are private and routed exclusively to administrators.
 */
async function submitSuggestion(req, res, next) {
  try {
    const {
      foodSpotId,
      suggestionType = 'price_change',
      dishName,
      currentPrice,
      suggestedPrice,
      category,
      notes,
      userEmail,
      userName
    } = req.body;

    if (!foodSpotId || String(foodSpotId).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Food spot / restaurant selection is required.'
      });
    }

    if (!dishName || String(dishName).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Dish or item name is required.'
      });
    }

    // Resolve food spot name
    let spotName = null;
    try {
      const spot = await dataStore.getFoodSpotById(foodSpotId);
      if (spot) {
        spotName = spot.name;
      }
    } catch (e) {
      // Spot lookup optional
    }

    // Attach student session info if logged in
    const sessionUser = req.session?.user;
    const resolvedUserId = sessionUser?.id || null;
    const resolvedUserName = userName?.trim() || sessionUser?.name || 'Student Contributor';
    const resolvedUserEmail = userEmail?.trim() || sessionUser?.email || null;

    const newSuggestion = await dataStore.addSuggestion({
      userId: resolvedUserId,
      userName: resolvedUserName,
      userEmail: resolvedUserEmail,
      foodSpotId: String(foodSpotId).trim(),
      foodSpotName: spotName || String(foodSpotId).trim(),
      suggestionType: String(suggestionType).trim(),
      dishName: String(dishName).trim(),
      currentPrice: currentPrice !== undefined && currentPrice !== null && currentPrice !== '' ? Number(currentPrice) : null,
      suggestedPrice: suggestedPrice !== undefined && suggestedPrice !== null && suggestedPrice !== '' ? Number(suggestedPrice) : null,
      category: category ? String(category).trim() : null,
      notes: notes ? String(notes).trim() : null
    });

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully. Sent to campus dining administrators for verification.',
      data: {
        id: newSuggestion.id,
        foodSpotName: newSuggestion.foodSpotName,
        dishName: newSuggestion.dishName,
        status: newSuggestion.status
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitSuggestion
};
