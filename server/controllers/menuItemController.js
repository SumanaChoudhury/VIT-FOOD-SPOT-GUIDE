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
    const cleanCat = cleanStringParam(category);
    const cleanLoc = cleanStringParam(location);

    if (!cleanQ && !cleanCat && !cleanLoc) {
      return res.status(400).json({ success: false, error: 'Search query parameter "q", "category", or "location" is required.' });
    }

    const trimmed = cleanQ || cleanCat || cleanLoc;

    const result = await dataStore.getMenuItems({
      search: cleanQ,
      location: cleanLoc,
      maxPrice: cleanNumberParam(maxPrice),
      minPrice: cleanNumberParam(minPrice),
      dietary: cleanStringParam(dietary),
      category: cleanCat,
      limit: cleanNumberParam(limit) || 100
    });

    // Also match food spots (both by spot metadata AND by outlets that serve the matching dishes)
    const allSpots = await dataStore.getFoodSpots({});
    const spotMap = new Map();
    allSpots.forEach(s => {
      spotMap.set(s.id, s);
      spotMap.set(s.slug, s);
    });

    const qLower = trimmed.toLowerCase();
    const searchTerms = [qLower];
    if (qLower.includes('biryani')) searchTerms.push(qLower.replace(/biryani/g, 'biriyani'));
    if (qLower.includes('biriyani')) searchTerms.push(qLower.replace(/biriyani/g, 'biryani'));
    if (qLower.includes('juice') || qLower.includes('shake') || qLower.includes('beverage')) {
      searchTerms.push('juice', 'shake', 'smoothie', 'lassi');
    }
    if (qLower.includes('chai') || qLower.includes('tea')) {
      searchTerms.push('chai', 'tea', 'coffee');
    }
    if (qLower.includes('roll') || qLower.includes('snack') || qLower.includes('burger')) {
      searchTerms.push('roll', 'snack', 'burger', 'sandwich', 'fast food');
    }
    if (qLower.includes('biryani') || qLower.includes('meal') || qLower.includes('thali')) {
      searchTerms.push('biryani', 'meal', 'thali', 'rice');
    }
    if (qLower.includes('dosa') || qLower.includes('idli') || qLower.includes('south')) {
      searchTerms.push('dosa', 'idli', 'south indian', 'tiffin');
    }
    if (qLower.includes('dessert') || qLower.includes('ice cream') || qLower.includes('cake') || qLower.includes('waffle') || qLower.includes('bakery')) {
      searchTerms.push('dessert', 'ice cream', 'cake', 'waffle', 'bakery');
    }

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

    if (cleanLoc) {
      const loc = cleanLoc.toLowerCase();
      matchingSpots = matchingSpots.filter(s => s.location === loc || s.locationId === loc);
    }
    if (cleanCat) {
      const cat = cleanCat.toLowerCase();
      matchingSpots = matchingSpots.filter(s => s.categories && s.categories.some(c => c.toLowerCase().includes(cat)));
    }

    const locNameMap = {
      prp: 'PRP — Pearl Research Park',
      sjt: 'SJT (Silver Jubilee Tower)',
      tt: 'TT (Technology Tower)',
      mgb: 'MGB (Mahatma Gandhi Block)',
      gdn: 'GDN (G.D. Naidu Block)',
      smv: 'SMV (Sir M. Visvesvaraya)',
      lh: "Ladies' Hostel Area (LH)",
      mh: "Boys' Hostel Area (MH)",
      library: 'Central Library & Walkway',
      kc: 'KC Food & Gazebo Hub'
    };

    const enriched = result.items.map(dish => {
      const s = spotMap.get(dish.foodSpotId) || spotMap.get(dish.foodSpotSlug) || spotMap.get(dish.foodSpot);
      const spotName = s?.name || dish.foodSpotName || 'Campus Outlet';
      const locId = s?.locationId || dish.locationId || 'campus';
      const campusBlockName = locNameMap[locId] || s?.locationName || (locId ? locId.toUpperCase() : 'VIT Campus');
      const specificLoc = s?.specificLocation || '';
      const spotLocation = specificLoc ? `${campusBlockName} • ${specificLoc}` : campusBlockName;

      return {
        ...dish,
        spotName,
        foodSpotName: spotName,
        locationId: locId,
        locationName: campusBlockName,
        specificLocation: specificLoc,
        spotLocation,
        spotZone: s?.zone || dish.spotZone || 'Campus'
      };
    });

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
