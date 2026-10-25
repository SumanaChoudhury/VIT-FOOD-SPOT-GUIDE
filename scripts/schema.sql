-- ============================================================================
-- VIT Food Spot Guide — Relational Database Schema (MySQL)
-- Architecture: MySQL Database <- JDBC <- Java Server / Node.js
-- ============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS vit_food_spots
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vit_food_spots;

-- ----------------------------------------------------------------------------
-- Table 1: Locations (Academic Blocks, Hostels, Hubs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'academic_block', 'hostel', 'library', 'central_hub'
  parent VARCHAR(100) DEFAULT 'VIT Vellore Campus',
  nearby_locations JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_locations_type ON locations(type);

-- ----------------------------------------------------------------------------
-- Table 2: Food Spots
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_spots (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  zone VARCHAR(100) NOT NULL, -- "Boys' Hostel", "Girls' Hostel", "Academic Blocks", "Cafes Around VIT"
  specific_location VARCHAR(255) NULL,
  categories JSON NULL,
  description TEXT NULL,
  status VARCHAR(50) DEFAULT 'available', -- 'available' or 'unavailable' (Menu not available yet)
  must_try_item VARCHAR(150) NULL,
  recommended_by VARCHAR(100) DEFAULT 'Student community',
  is_counter_based BOOLEAN DEFAULT FALSE,
  shared_menu_id VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_foodspots_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_foodspots_zone ON food_spots(zone);
CREATE INDEX idx_foodspots_location ON food_spots(location_id);
CREATE INDEX idx_foodspots_status ON food_spots(status);
CREATE INDEX idx_foodspots_name ON food_spots(name);

-- ----------------------------------------------------------------------------
-- Table 3: Menu Items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(100) PRIMARY KEY,
  food_spot_id VARCHAR(50) NOT NULL,
  counter_slug VARCHAR(100) NULL, -- For One Food World counters
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NULL, -- NULL when price not clearly listed
  dietary VARCHAR(20) DEFAULT 'unclassified', -- 'veg', 'non-veg', 'unclassified'
  dietary_source VARCHAR(20) DEFAULT 'unknown',
  variants JSON NULL, -- Array of variant objects { variant, price }
  is_must_try BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_menuitems_foodspot FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_menuitems_spot ON menu_items(food_spot_id);
CREATE INDEX idx_menuitems_category ON menu_items(category);
CREATE INDEX idx_menuitems_price ON menu_items(price);
CREATE INDEX idx_menuitems_dietary ON menu_items(dietary);
CREATE INDEX idx_menuitems_name ON menu_items(name);

-- ----------------------------------------------------------------------------
-- Table 4: Users (Students and Administrators)
-- Strict VIT email requirement: firstname.lastname@vitstudent.ac.in
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student', -- 'student', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- Table 5: Feedback (Ratings and Reviews)
-- Drives dynamic "Student Favourite" and recommendation scores
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NULL,
  user_name VARCHAR(100) DEFAULT 'Anonymous Student',
  food_spot_id VARCHAR(50) NOT NULL,
  menu_item_id VARCHAR(100) NULL,
  menu_item_name VARCHAR(200) NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT NULL,
  is_recommended BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_foodspot FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_feedback_spot ON feedback(food_spot_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_user ON feedback(user_id);

-- ----------------------------------------------------------------------------
-- Table 6: Favorites (Student Saved Foods & Spots)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  food_spot_id VARCHAR(50) NOT NULL,
  menu_item_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_foodspot FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_favorite UNIQUE (user_id, food_spot_id, menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_spot ON favorites(food_spot_id);

-- ----------------------------------------------------------------------------
-- Table 7: Suggestions (Private User Menu & Price Suggestions for Admins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suggestions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  user_name VARCHAR(255) NULL,
  user_email VARCHAR(255) NULL,
  food_spot_id VARCHAR(64) NOT NULL,
  food_spot_name VARCHAR(255) NULL,
  suggestion_type VARCHAR(50) NOT NULL,
  dish_name VARCHAR(255) NOT NULL,
  current_price DECIMAL(10,2) NULL,
  suggested_price DECIMAL(10,2) NULL,
  category VARCHAR(100) NULL,
  notes TEXT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sug_foodspot FOREIGN KEY (food_spot_id) REFERENCES food_spots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_suggestions_spot ON suggestions(food_spot_id);
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_created ON suggestions(created_at);
