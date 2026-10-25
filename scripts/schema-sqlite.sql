-- ============================================================================
-- VIT Food Spot Guide — Relational Database Schema (SQLite Fallback Engine)
-- ============================================================================

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent TEXT DEFAULT 'VIT Vellore Campus',
  nearby_locations TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);

CREATE TABLE IF NOT EXISTS food_spots (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location_id TEXT NOT NULL,
  zone TEXT NOT NULL,
  specific_location TEXT NULL,
  categories TEXT NULL,
  description TEXT NULL,
  status TEXT DEFAULT 'available',
  must_try_item TEXT NULL,
  recommended_by TEXT DEFAULT 'Student community',
  is_counter_based INTEGER DEFAULT 0,
  shared_menu_id TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_foodspots_zone ON food_spots(zone);
CREATE INDEX IF NOT EXISTS idx_foodspots_location ON food_spots(location_id);
CREATE INDEX IF NOT EXISTS idx_foodspots_status ON food_spots(status);
CREATE INDEX IF NOT EXISTS idx_foodspots_name ON food_spots(name);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  food_spot_id TEXT NOT NULL,
  counter_slug TEXT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NULL,
  dietary TEXT DEFAULT 'unclassified',
  dietary_source TEXT DEFAULT 'unknown',
  variants TEXT NULL,
  is_must_try INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menuitems_spot ON menu_items(food_spot_id);
CREATE INDEX IF NOT EXISTS idx_menuitems_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menuitems_price ON menu_items(price);
CREATE INDEX IF NOT EXISTS idx_menuitems_dietary ON menu_items(dietary);
CREATE INDEX IF NOT EXISTS idx_menuitems_name ON menu_items(name);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NULL,
  user_name TEXT DEFAULT 'Anonymous Student',
  food_spot_id TEXT NOT NULL,
  menu_item_id TEXT NULL,
  menu_item_name TEXT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT NULL,
  is_recommended INTEGER DEFAULT 1,
  status TEXT DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_spot ON feedback(food_spot_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_spot_id TEXT NOT NULL,
  menu_item_id TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE,
  UNIQUE (user_id, food_spot_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_spot ON favorites(food_spot_id);
