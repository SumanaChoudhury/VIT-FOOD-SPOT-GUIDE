const { query, queryOne, execute } = require('../config/db');

// One Food World 6 Counters canonical reference
const OFW_COUNTERS = [
  { slug: 'al-beirut', name: 'Al Beirut', cuisine: 'Lebanese Rolls, Shawarma, Grilled BBQ', foodSpotSlug: 'one-food-world' },
  { slug: 'korean-wok-box', name: 'Korean Wok Box', cuisine: 'Pan-Asian, Manchurian, Rice & Noodles', foodSpotSlug: 'one-food-world' },
  { slug: 'hollywood-thick-shake-bar', name: 'Hollywood Thick Shake Bar', cuisine: 'Thick Shakes, Fresh Juices, Ice Creams, Sundaes', foodSpotSlug: 'one-food-world' },
  { slug: 'us-pizzeria', name: 'US Pizzeria', cuisine: 'Pizzas, Calzones, Lasagna, Pasta, Nachos', foodSpotSlug: 'one-food-world' },
  { slug: 'texas-fried-chicken', name: 'Texas Fried Chicken', cuisine: 'Southern Fried Chicken, Crispy Combos, Wings', foodSpotSlug: 'one-food-world' },
  { slug: 'fried-chicken-and-burgers', name: 'Fried Chicken & Burgers', cuisine: 'Burgers, Wraps, Crispy Bites, Meal Packs', foodSpotSlug: 'one-food-world' }
];

class RelationalDataStore {

  // --- Locations ---
  async getLocations() {
    const rows = await query('SELECT * FROM locations ORDER BY name ASC');
    return rows.map(r => ({
      _id: r.id,
      id: r.id,
      slug: r.id,
      name: r.name,
      type: r.type,
      parent: r.parent,
      relationships: r.nearby_locations ? (typeof r.nearby_locations === 'string' ? JSON.parse(r.nearby_locations) : r.nearby_locations) : []
    }));
  }

  // --- Food Spots ---
  async getFoodSpots(filter = {}) {
    let sql = 'SELECT f.*, l.name as location_name FROM food_spots f LEFT JOIN locations l ON f.location_id = l.id WHERE 1=1';
    const params = [];

    if (filter.zone) {
      const z = String(filter.zone).toLowerCase().trim();
      if (z === 'hostel') {
        sql += " AND (LOWER(f.zone) LIKE '%hostel%' OR f.location_id IN ('mh', 'lh'))";
      } else if (z === 'academic') {
        sql += " AND (LOWER(f.zone) LIKE '%academic%' OR f.location_id NOT IN ('mh', 'lh'))";
      } else {
        sql += ' AND (LOWER(f.zone) = ? OR LOWER(f.zone) LIKE ?)';
        params.push(z, `%${z}%`);
      }
    }
    if (filter.location_id || filter.location) {
      sql += ' AND (f.location_id = ? OR f.location_id = ?)';
      params.push(filter.location_id || filter.location, filter.location_id || filter.location);
    }
    if (filter.status) {
      sql += ' AND f.status = ?';
      params.push(filter.status);
    }

    sql += ' ORDER BY f.name ASC';
    const rows = await query(sql, params);

    let statsMap = {};
    try {
      const stats = await query(
        `SELECT food_spot_id, MIN(price) as min_p, MAX(price) as max_p,
                SUM(CASE WHEN dietary = 'veg' THEN 1 ELSE 0 END) as veg_count,
                SUM(CASE WHEN dietary = 'non-veg' THEN 1 ELSE 0 END) as non_veg_count
         FROM menu_items
         GROUP BY food_spot_id`
      );
      stats.forEach(s => {
        statsMap[s.food_spot_id] = {
          minPrice: s.min_p !== null ? Number(s.min_p) : null,
          maxPrice: s.max_p !== null ? Number(s.max_p) : null,
          hasVeg: (s.veg_count || 0) > 0,
          hasNonVeg: (s.non_veg_count || 0) > 0
        };
      });
    } catch (e) {
      statsMap = {};
    }

    return rows.map(r => {
      const formatted = this.formatSpot(r);
      const st = statsMap[r.id] || statsMap[r.slug] || {};
      return {
        ...formatted,
        minPrice: st.minPrice !== undefined ? st.minPrice : null,
        maxPrice: st.maxPrice !== undefined ? st.maxPrice : null,
        hasVeg: st.hasVeg !== undefined ? st.hasVeg : true,
        hasNonVeg: st.hasNonVeg !== undefined ? st.hasNonVeg : false
      };
    });
  }

  async getFoodSpotByIdOrSlug(idOrSlug) {
    const row = await queryOne(
      'SELECT f.*, l.name as location_name FROM food_spots f LEFT JOIN locations l ON f.location_id = l.id WHERE f.id = ? OR f.slug = ?',
      [idOrSlug, idOrSlug]
    );
    return row ? this.formatSpot(row) : null;
  }

  formatSpot(r) {
    let cats = [];
    try {
      cats = r.categories ? (typeof r.categories === 'string' ? JSON.parse(r.categories) : r.categories) : [];
    } catch (e) {
      cats = [];
    }
    return {
      _id: r.id,
      id: r.id,
      slug: r.slug,
      name: r.name,
      location: r.location_id,
      locationId: r.location_id,
      locationName: r.location_name || r.location_id,
      zone: r.zone,
      specificLocation: r.specific_location,
      categories: cats,
      description: r.description,
      status: r.status,
      menuStatus: r.status,
      mustTryItem: r.must_try_item,
      recommendedBy: r.recommended_by,
      isCounterBased: Boolean(r.is_counter_based),
      sharedMenuId: r.shared_menu_id,
      createdAt: r.created_at
    };
  }

  // --- OFW Counters ---
  async getCounters(foodSpotSlug = null) {
    if (!foodSpotSlug || foodSpotSlug === 'one-food-world') {
      return OFW_COUNTERS;
    }
    return [];
  }

  // --- Menu Items ---
  async getMenuItems(options = {}) {
    const { foodSpot, counter, category, location, maxPrice, minPrice, dietary, isMustTry, search, limit = 500, skip = 0 } = options;

    const cleanStr = (v) => {
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim();
      const lower = s.toLowerCase();
      return (lower === '' || lower === 'undefined' || lower === 'null' || lower === 'all') ? undefined : s;
    };
    const cleanNum = (v) => {
      const s = cleanStr(v);
      if (s === undefined) return undefined;
      const n = Number(s);
      return (isNaN(n) || !isFinite(n)) ? undefined : n;
    };

    const cleanSpot = cleanStr(foodSpot);
    const cleanCounter = cleanStr(counter);
    const cleanCat = cleanStr(category);
    const cleanLoc = cleanStr(location);
    const cleanDiet = cleanStr(dietary);
    const cleanMax = cleanNum(maxPrice);
    const cleanMin = cleanNum(minPrice);
    const cleanQ = cleanStr(search);

    let sql = 'SELECT m.*, f.name as spot_name, f.slug as spot_slug, f.zone as spot_zone, f.location_id FROM menu_items m JOIN food_spots f ON m.food_spot_id = f.id WHERE 1=1';
    const params = [];

    if (cleanSpot) {
      sql += ' AND (m.food_spot_id = ? OR f.slug = ?)';
      params.push(cleanSpot, cleanSpot);
    }
    if (cleanLoc) {
      sql += ' AND (f.location_id = ? OR f.slug = ?)';
      params.push(cleanLoc.toLowerCase(), cleanLoc.toLowerCase());
    }
    if (cleanCounter) {
      sql += ' AND m.counter_slug = ?';
      params.push(cleanCounter.toLowerCase());
    }
    if (cleanCat) {
      sql += ' AND LOWER(m.category) LIKE ?';
      params.push(`%${cleanCat.toLowerCase()}%`);
    }
    if (cleanDiet) {
      sql += ' AND m.dietary = ?';
      params.push(cleanDiet);
    }
    if (isMustTry !== undefined && isMustTry !== null) {
      sql += ' AND m.is_must_try = ?';
      params.push(isMustTry ? 1 : 0);
    }
    if (cleanMax !== undefined) {
      sql += ' AND m.price IS NOT NULL AND m.price <= ?';
      params.push(cleanMax);
    }
    if (cleanMin !== undefined) {
      sql += ' AND m.price IS NOT NULL AND m.price >= ?';
      params.push(cleanMin);
    }
    if (cleanQ) {
      const qTrim = cleanQ.toLowerCase();
      const terms = [qTrim];
      if (qTrim.includes('biryani')) {
        terms.push(qTrim.replace(/biryani/g, 'biriyani'));
      } else if (qTrim.includes('biriyani')) {
        terms.push(qTrim.replace(/biriyani/g, 'biryani'));
      }

      const orClauses = [];
      for (const t of terms) {
        orClauses.push('(LOWER(m.name) LIKE ? OR LOWER(m.category) LIKE ? OR LOWER(f.name) LIKE ?)');
        const s = `%${t}%`;
        params.push(s, s, s);
      }
      sql += ` AND (${orClauses.join(' OR ')})`;
    }

    // Count query
    const countSql = sql.replace('SELECT m.*, f.name as spot_name, f.slug as spot_slug, f.zone as spot_zone, f.location_id', 'SELECT COUNT(*) as count');
    const countRows = await query(countSql, params);
    const total = countRows[0] ? (countRows[0].count || 0) : 0;

    sql += ' ORDER BY m.price IS NULL, m.price ASC, m.name ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(skip));

    const rows = await query(sql, params);
    const items = rows.map(r => this.formatMenuItem(r));

    return {
      total,
      limit: Number(limit),
      skip: Number(skip),
      items
    };
  }

  formatMenuItem(r) {
    let variants = [];
    try {
      variants = r.variants ? (typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants) : [];
    } catch (e) {
      variants = [];
    }
    return {
      _id: r.id,
      id: r.id,
      foodSpot: r.food_spot_id,
      foodSpotId: r.food_spot_id,
      foodSpotSlug: r.spot_slug || r.food_spot_id,
      foodSpotName: r.spot_name || '',
      spotZone: r.spot_zone || '',
      locationId: r.location_id || '',
      counter: r.counter_slug,
      counterId: r.counter_slug,
      name: r.name,
      normalizedName: r.name.toLowerCase(),
      category: r.category,
      categories: [r.category],
      price: r.price !== null ? Number(r.price) : null,
      foodClassification: r.dietary,
      dietary: r.dietary,
      dietarySource: r.dietary_source,
      variants,
      isMustTry: Boolean(r.is_must_try)
    };
  }

  // --- Dynamic Student Favourites via SQL Aggregate Join ---
  async getStudentFavourites() {
    const sql = `
      SELECT f.id, f.slug, f.name, f.zone, f.location_id, f.specific_location, f.categories, f.must_try_item,
             COUNT(fb.id) as review_count, AVG(fb.rating) as avg_rating
      FROM food_spots f
      JOIN feedback fb ON f.id = fb.food_spot_id
      GROUP BY f.id, f.slug, f.name, f.zone, f.location_id, f.specific_location, f.categories, f.must_try_item
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT 10
    `;
    const rows = await query(sql);
    return rows.map(r => ({
      ...this.formatSpot(r),
      reviewCount: Number(r.review_count),
      avgRating: Number(Number(r.avg_rating).toFixed(1))
    }));
  }

  // --- Feedback ---
  async getFeedback(foodSpotId = null) {
    let sql = 'SELECT fb.*, fs.name as food_spot_name FROM feedback fb LEFT JOIN food_spots fs ON fb.food_spot_id = fs.id WHERE 1=1';
    const params = [];
    if (foodSpotId) {
      sql += ' AND fb.food_spot_id = ?';
      params.push(foodSpotId);
    }
    sql += ' ORDER BY fb.created_at DESC LIMIT 50';
    const rows = await query(sql, params);
    return rows.map(r => ({
      _id: r.id,
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      foodSpotId: r.food_spot_id,
      foodSpotName: r.food_spot_name || r.food_spot_id,
      menuItemId: r.menu_item_id,
      menuItemName: r.menu_item_name,
      rating: r.rating,
      feedbackText: r.feedback_text,
      isRecommended: Boolean(r.is_recommended),
      createdAt: r.created_at
    }));
  }

  async addFeedback(fbData) {
    const id = 'fb_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const userId = fbData.userId || null;
    const userName = fbData.userName || 'Anonymous Student';
    const foodSpotId = fbData.foodSpotId;
    const menuItemId = fbData.menuItemId || null;
    const menuItemName = fbData.menuItemName || null;
    const rating = Math.min(5, Math.max(1, parseInt(fbData.rating || 5, 10)));
    const feedbackText = fbData.feedbackText || fbData.comment || '';

    await execute(
      'INSERT INTO feedback (id, user_id, user_name, food_spot_id, menu_item_id, menu_item_name, rating, feedback_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, userName, foodSpotId, menuItemId, menuItemName, rating, feedbackText]
    );

    return {
      _id: id,
      id,
      userId,
      userName,
      foodSpotId,
      menuItemId,
      menuItemName,
      rating,
      feedbackText,
      createdAt: new Date().toISOString()
    };
  }

  // Legacy student recommendations compatibility
  async getRecommendations(status = 'approved') {
    const rows = await this.getFeedback();
    return rows.map(r => ({
      _id: r.id,
      foodSpotSlug: r.foodSpotId,
      foodSpotName: r.foodSpotId,
      dishName: r.menuItemName || 'Special Item',
      category: 'Student Pick',
      recommendedReason: r.feedbackText,
      authorName: r.userName,
      status: 'approved',
      upvotes: r.rating * 4,
      createdAt: r.createdAt
    }));
  }

  async addRecommendation(recData) {
    return await this.addFeedback({
      foodSpotId: recData.foodSpotSlug || recData.foodSpotId,
      menuItemName: recData.dishName,
      feedbackText: recData.recommendedReason,
      userName: recData.authorName || 'Student',
      rating: 5
    });
  }

  // --- Users & Auth ---
  async getUserByEmail(email) {
    const row = await queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return row;
  }

  async getUserById(id) {
    const row = await queryOne('SELECT * FROM users WHERE id = ?', [id]);
    return row;
  }

  async createUser(userData) {
    const id = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const role = userData.role || 'student';
    await execute(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, userData.email.toLowerCase().trim(), userData.passwordHash, userData.name, role]
    );
    return {
      id,
      email: userData.email,
      name: userData.name,
      role
    };
  }

  // --- Favorites ---
  async getUserFavorites(userId) {
    const sql = `
      SELECT fav.id as fav_id, fav.created_at as fav_created_at,
             f.id as spot_id, f.slug as spot_slug, f.name as spot_name, f.zone, f.location_id, f.must_try_item,
             m.id as item_id, m.name as item_name, m.price, m.category as item_category, m.dietary
      FROM favorites fav
      JOIN food_spots f ON fav.food_spot_id = f.id
      LEFT JOIN menu_items m ON fav.menu_item_id = m.id
      WHERE fav.user_id = ?
      ORDER BY fav.created_at DESC
    `;
    const rows = await query(sql, [userId]);
    return rows.map(r => ({
      favoriteId: r.fav_id,
      foodSpotId: r.spot_id,
      foodSpotSlug: r.spot_slug,
      foodSpotName: r.spot_name,
      zone: r.zone,
      locationId: r.location_id,
      menuItemId: r.item_id,
      menuItemName: r.item_name,
      price: r.price !== null ? Number(r.price) : null,
      dietary: r.dietary,
      createdAt: r.fav_created_at
    }));
  }

  async addFavorite(userId, foodSpotId, menuItemId = null) {
    const id = 'fav_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    try {
      await execute(
        'INSERT INTO favorites (id, user_id, food_spot_id, menu_item_id) VALUES (?, ?, ?, ?)',
        [id, userId, foodSpotId, menuItemId]
      );
      return { id, userId, foodSpotId, menuItemId };
    } catch (e) {
      // Return existing if duplicate
      const existing = await queryOne(
        'SELECT * FROM favorites WHERE user_id = ? AND food_spot_id = ? AND (menu_item_id = ? OR (menu_item_id IS NULL AND ? IS NULL))',
        [userId, foodSpotId, menuItemId, menuItemId]
      );
      return existing;
    }
  }

  async removeFavorite(userId, favoriteIdOrSpotId) {
    await execute(
      'DELETE FROM favorites WHERE user_id = ? AND (id = ? OR food_spot_id = ? OR menu_item_id = ?)',
      [userId, favoriteIdOrSpotId, favoriteIdOrSpotId, favoriteIdOrSpotId]
    );
    return true;
  }

  // --- Admin Stats ---
  async getAdminStats() {
    const spotsCount = (await query('SELECT COUNT(*) as c FROM food_spots'))[0].c;
    const itemsCount = (await query('SELECT COUNT(*) as c FROM menu_items'))[0].c;
    const unpricedCount = (await query('SELECT COUNT(*) as c FROM menu_items WHERE price IS NULL'))[0].c;
    const feedbackCount = (await query('SELECT COUNT(*) as c FROM feedback'))[0].c;
    const usersCount = (await query('SELECT COUNT(*) as c FROM users'))[0].c;

    return {
      totalOutlets: spotsCount,
      totalDishes: itemsCount,
      unpricedDishes: unpricedCount,
      pricedDishes: itemsCount - unpricedCount,
      totalReviews: feedbackCount,
      registeredUsers: usersCount,
      databaseEngine: (require('../config/db').getDatabaseStatus()).engine
    };
  }
}

const dataStore = new RelationalDataStore();
module.exports = dataStore;
