const dataStore = require('./dataStore');

/**
 * Transparent recommendation scoring engine
 *
 * Scoring Weights:
 * - Location proximity: 0 - 40 points
 *   (Direct same location: 40, adjacent: 30, close: 20, moderate: 10, other: 0)
 * - Category match: 0 - 20 points
 * - Budget match: 0 - 20 points (only valid numeric prices evaluated)
 * - Dietary match: 0 - 10 points
 * - Recommendation / Must-Try boost: 0 - 10 points
 *
 * Total max score = 100 points
 */
async function getRecommendations(criteria = {}) {
  const {
    location,       // location slug e.g. 'sjt', 'prp', 'lh', 'mh'
    category,       // e.g. 'Beverages', 'Fast Food', 'Meals'
    maxBudget,      // numeric max budget e.g. 100
    dietary,        // 'veg', 'non-veg'
    searchQuery,    // dish or outlet name
    limit = 10
  } = criteria;

  const allSpots = await dataStore.getFoodSpots({ active: true });
  const allLocations = await dataStore.getLocations();
  const allRecs = await dataStore.getRecommendations('approved');

  // Find user's location entity and relationships
  const userLocObj = allLocations.find(l => l.slug === location || l.name.toLowerCase().includes((location || '').toLowerCase()));
  const relationships = userLocObj ? (userLocObj.relationships || []) : [];

  const scoredSpots = [];

  for (const spot of allSpots) {
    let locationScore = 0;
    let locationJustification = 'Standard campus location';

    if (location) {
      if (spot.location === location || (userLocObj && spot.location === userLocObj.slug)) {
        locationScore = 40;
        locationJustification = `Located directly at ${userLocObj ? userLocObj.name : location}`;
      } else {
        const rel = relationships.find(r => r.nearbyLocation === spot.location);
        if (rel) {
          if (rel.proximityLevel === 'adjacent') {
            locationScore = 30;
            locationJustification = `Adjacent to ${userLocObj ? userLocObj.name : location}`;
          } else if (rel.proximityLevel === 'close') {
            locationScore = 20;
            locationJustification = `Short walking distance from ${userLocObj ? userLocObj.name : location}`;
          } else {
            locationScore = 10;
            locationJustification = `Within reachable vicinity of ${userLocObj ? userLocObj.name : location}`;
          }
        }
      }
    } else {
      locationScore = 20; // Default baseline when no location specified
      locationJustification = 'Campus-wide recommendation';
    }

    // Category Score (0 - 20)
    let categoryScore = 0;
    if (category) {
      const hasCat = spot.categories && spot.categories.some(c => c.toLowerCase() === category.toLowerCase());
      if (hasCat) {
        categoryScore = 20;
      }
    } else {
      categoryScore = 10;
    }

    // Recommendation / Student Community Score (0 - 10)
    let recScore = 0;
    const spotRecs = allRecs.filter(r => String(r.foodSpot) === String(spot._id) || r.foodSpotName.toLowerCase().includes(spot.name.toLowerCase()));
    if (spotRecs.length > 0) {
      recScore = Math.min(10, spotRecs.length * 3);
    } else if (spot.mustTryItem && spot.mustTryItem !== 'Menu information not available yet') {
      recScore = 5;
    }

    // Fetch sample dishes for this spot to check budget and dietary matches
    const { items: spotDishes } = await dataStore.getMenuItems({ foodSpot: spot._id, limit: 100 });

    // Budget Score (0 - 20)
    let budgetScore = 10;
    let matchingDishes = spotDishes;

    if (maxBudget) {
      const budgetNum = Number(maxBudget);
      const withinBudget = spotDishes.filter(d => d.price !== null && d.price <= budgetNum);
      if (withinBudget.length > 0) {
        budgetScore = Math.min(20, Math.round((withinBudget.length / Math.max(1, spotDishes.length)) * 25));
        matchingDishes = withinBudget;
      } else {
        budgetScore = 0;
      }
    }

    // Dietary Score (0 - 10)
    let dietaryScore = 5;
    if (dietary) {
      const dietaryMatch = matchingDishes.filter(d => d.foodClassification === dietary);
      if (dietaryMatch.length > 0) {
        dietaryScore = 10;
        matchingDishes = dietaryMatch;
      } else {
        dietaryScore = 0;
      }
    }

    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = spot.name.toLowerCase().includes(q);
      const dishMatch = spotDishes.some(d => d.normalizedName.includes(q));
      if (!nameMatch && !dishMatch) {
        continue; // Exclude non-matching spots
      }
      if (nameMatch) categoryScore += 10;
    }

    const totalScore = locationScore + categoryScore + budgetScore + dietaryScore + recScore;

    // Recommendation badge label
    let recommendationBadge = 'Menu-based suggestion';
    if (spotRecs.length > 0) {
      recommendationBadge = "Students' Favourite";
    } else if (spot.recommendedBy === 'Our pick') {
      recommendationBadge = 'Our Pick';
    } else if (spot.recommendedBy === "Friend's pick") {
      recommendationBadge = "Friend's Pick";
    }

    scoredSpots.push({
      spot,
      score: totalScore,
      scoreBreakdown: {
        locationScore,
        categoryScore,
        budgetScore,
        dietaryScore,
        recommendationScore: recScore,
        maxPossible: 100
      },
      justification: locationJustification,
      recommendationBadge,
      sampleMatchingDishes: matchingDishes.slice(0, 4)
    });
  }

  scoredSpots.sort((a, b) => b.score - a.score);

  return scoredSpots.slice(0, Number(limit));
}

module.exports = {
  getRecommendations
};
