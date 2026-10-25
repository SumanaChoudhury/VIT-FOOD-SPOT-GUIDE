const dataStore = require('../services/dataStore');
const { generateFoodSpotsXml } = require('../utils/xmlGenerator');
const { getDatabaseStatus } = require('../config/db');

async function exportXml(req, res, next) {
  try {
    const spots = await dataStore.getFoodSpots();
    const { items } = await dataStore.getMenuItems({ limit: 5000 });

    const xml = generateFoodSpotsXml(spots, items);
    res.header('Content-Type', 'application/xml');
    res.attachment('vit_food_spots.xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const { items } = await dataStore.getMenuItems({ limit: 5000 });
    let csv = 'Spot Name,Counter,Item Name,Price,Classification,Category\n';

    items.forEach(i => {
      const spotName = `"${(i.foodSpotName || '').replace(/"/g, '""')}"`;
      const counterName = `"${(i.counter || '').replace(/"/g, '""')}"`;
      const itemName = `"${(i.name || '').replace(/"/g, '""')}"`;
      const price = i.price !== null ? i.price : 'N/A';
      const classification = i.dietary || 'unclassified';
      const category = `"${(i.category || '').replace(/"/g, '""')}"`;
      csv += `${spotName},${counterName},${itemName},${price},${classification},${category}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('vit_menu_items.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function getHealth(req, res) {
  const dbStatus = getDatabaseStatus();
  const stats = await dataStore.getAdminStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStatus,
    dataSummary: {
      spotsCount: stats.totalOutlets,
      dishesCount: stats.totalDishes,
      recommendationsCount: stats.totalReviews
    }
  });
}

module.exports = {
  exportXml,
  exportCsv,
  getHealth
};
