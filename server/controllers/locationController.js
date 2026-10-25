const dataStore = require('../services/dataStore');

async function getLocations(req, res, next) {
  try {
    const locations = await dataStore.getLocations();
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (err) {
    next(err);
  }
}

async function getLocationBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const locations = await dataStore.getLocations();
    const location = locations.find(l => l.slug === slug || l.id === slug || l.name.toLowerCase().includes(slug.toLowerCase()));
    if (!location) {
      return res.status(404).json({ success: false, error: 'Campus location not found' });
    }

    // Find all spots at this location
    const allSpots = await dataStore.getFoodSpots();
    const spotsAtLocation = allSpots.filter(s => s.location === location.id || s.locationId === location.id);

    // Find adjacent/nearby spots based on location relationships
    const nearbySpotMap = [];
    (location.relationships || []).forEach(relLocId => {
      const relId = typeof relLocId === 'string' ? relLocId : (relLocId.nearbyLocation || '');
      const relatedSpots = allSpots.filter(s => s.location === relId || s.locationId === relId);
      if (relatedSpots.length > 0) {
        nearbySpotMap.push({
          nearbyLocation: relId,
          spots: relatedSpots
        });
      }
    });

    res.json({
      success: true,
      data: {
        location,
        directSpots: spotsAtLocation,
        nearbySpots: nearbySpotMap
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLocations,
  getLocationBySlug
};
