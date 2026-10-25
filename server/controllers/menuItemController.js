const dataStore = require('../services/dataStore');
const { query } = require('../config/db');

function cleanStringParam(val) {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim();
  const lower = s.toLowerCase();
  if (lower === '' || lower === 'undefined' || lower === 'null' || lower === 'all') {
    return undefined;
  }
  return s;
}

function cleanNumberParam(val) {
  const s = cleanStringParam(val);
  if (s === undefined) return undefined;
  const n = Number(s);
  return (isNaN(n) || !isFinite(n)) ? undefined : n;
}

async function getMenuItems(req, res, next) {
  try {
    const { foodSpot, counter, category, maxPrice, minPrice, dietary, isMustTry, search, limit, skip } = req.query;

    const result = await dataStore.getMenuItems({
      foodSpot: cleanStringParam(foodSpot),
      counter: cleanStringParam(counter),
      category: cleanStringParam(category),
      maxPrice: cleanNumberParam(maxPrice),
      minPrice: cleanNumberParam(minPrice),
      dietary: cleanStringParam(dietary),
      isMustTry: isMustTry !== undefined ? isMustTry === 'true' : undefined,
      search: cleanStringParam(search),
      limit: cleanNumberParam(limit) || 100,
      skip: cleanNumberParam(skip) || 0
    });

    res.json({
      success: true,
      total: result.total,
      limit: result.limit,
      skip: result.skip,
      count: result.items.length,
      data: result.items
    });
  } catch (err) {
    next(err);
  }
}

async function searchDishes(req, res, next) {
  try {
    const { q, location, maxPrice, minPrice, dietary, category, limit } = req.query;
    const cleanQ = cleanStringParam(q);
    if (!cleanQ || cleanQ.length === 0) {
      return res.status(400).json({ success: false, error: 'Search query parameter "q" is required.' });
    }

    const trimmed = cleanQ;

    const result = await dataStore.getMenuItems({
      search: trimmed,
      location: cleanStringParam(location),
      maxPrice: cleanNumberParam(maxPrice),
      minPrice: cleanNumberParam(minPrice),
      dietary: cleanStringParam(dietary),
      category: cleanStringParam(category),
      limit: cleanNumberParam(limit) || 100
    });

    // Also match food spots (both by spot metadata AND by outlets that serve the matching dishes)
    const allSpots = await dataStore.getFoodSpots({});
    const qLower = trimmed.toLowerCase();
    const searchTerms = [qLower];
    if (qLower.includes('biryani')) searchTerms.push(qLower.replace(/biryani/g, 'biriyani'));
    if (qLower.includes('biriyani')) searchTerms.push(qLower.replace(/biriyani/g, 'biryani'));

    const spotIdsFromDishes = new Set(result.items.map(i => i.foodSpotId || i.foodSpot));

    let matchingSpots = allSpots.filter(s => {
      if (spotIdsFromDishes.has(s.id) || spotIdsFromDishes.has(s.slug)) return true;

      const nameL = (s.name || '').toLowerCase();
      const slugL = (s.slug || '').toLowerCase();
      const locL = (s.specificLocation || '').toLowerCase();
      const descL = (s.description || '').toLowerCase();
      const catsL = (s.categories || []).map(c => String(c).toLowerCase());

      return searchTerms.some(t => 
        nameL.includes(t) ||
        slugL.includes(t) ||
        locL.includes(t) ||
        descL.includes(t) ||
        catsL.some(c => c.includes(t))
      );
    });

    if (cleanStringParam(location)) {
      const loc = cleanStringParam(location).toLowerCase();
      matchingSpots = matchingSpots.filter(s => s.location === loc || s.locationId === loc);
    }
    if (cleanStringParam(category)) {
      const cat = cleanStringParam(category).toLowerCase();
      matchingSpots = matchingSpots.filter(s => s.categories && s.categories.some(c => c.toLowerCase().includes(cat)));
    }

    const enriched = result.items.map(dish => ({
      ...dish,
      spotName: dish.foodSpotName || 'Campus Outlet',
      spotLocation: dish.foodSpotSlug || 'VIT Campus',
      spotZone: dish.spotZone || 'Campus'
    }));

    res.json({
      success: true,
      query: trimmed,
      total: result.total,
      data: enriched,
      spots: matchingSpots
    });
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const rows = await query('SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL AND category != "" ORDER BY category ASC');
    const sorted = rows.map(r => r.category);
    res.json({
      success: true,
      count: sorted.length,
      data: sorted
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMenuItems,
  searchDishes,
  getCategories
};
