package jdbc;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * CampusFoodDB — Core JDBC Data Access Object (DAO)
 * Demonstrates Module 7 syllabus requirements:
 * - DDL execution (CREATE TABLE, INDEX)
 * - DML execution (INSERT, UPDATE, DELETE)
 * - Parameterized Queries with PreparedStatement (SQL injection protection)
 * - Result retrieval with ResultSet
 * - Dynamic SQL aggregation for student recommendations
 */
public class CampusFoodDB {

    private Connection conn;

    public CampusFoodDB(Connection conn) {
        this.conn = conn;
    }

    public void initSchema() throws SQLException {
        Statement stmt = conn.createStatement();

        // 1. Locations
        stmt.execute("CREATE TABLE IF NOT EXISTS locations (" +
                     "id VARCHAR(50) PRIMARY KEY, " +
                     "name VARCHAR(150) NOT NULL, " +
                     "type VARCHAR(50) NOT NULL, " +
                     "parent VARCHAR(100) DEFAULT 'VIT Vellore Campus', " +
                     "nearby_locations TEXT NULL)");

        // 2. Food Spots
        stmt.execute("CREATE TABLE IF NOT EXISTS food_spots (" +
                     "id VARCHAR(50) PRIMARY KEY, " +
                     "slug VARCHAR(100) UNIQUE NOT NULL, " +
                     "name VARCHAR(150) NOT NULL, " +
                     "location_id VARCHAR(50) NOT NULL, " +
                     "zone VARCHAR(100) NOT NULL, " +
                     "specific_location VARCHAR(255) NULL, " +
                     "categories TEXT NULL, " +
                     "description TEXT NULL, " +
                     "status VARCHAR(50) DEFAULT 'available', " +
                     "must_try_item VARCHAR(150) NULL, " +
                     "recommended_by VARCHAR(100) DEFAULT 'Student community', " +
                     "is_counter_based INTEGER DEFAULT 0, " +
                     "shared_menu_id VARCHAR(50) NULL)");

        // 3. Menu Items
        stmt.execute("CREATE TABLE IF NOT EXISTS menu_items (" +
                     "id VARCHAR(100) PRIMARY KEY, " +
                     "food_spot_id VARCHAR(50) NOT NULL, " +
                     "counter_slug VARCHAR(100) NULL, " +
                     "name VARCHAR(200) NOT NULL, " +
                     "category VARCHAR(100) NOT NULL, " +
                     "price REAL NULL, " +
                     "dietary VARCHAR(20) DEFAULT 'unclassified', " +
                     "dietary_source VARCHAR(20) DEFAULT 'unknown', " +
                     "variants TEXT NULL, " +
                     "is_must_try INTEGER DEFAULT 0)");

        // 4. Users
        stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                     "id VARCHAR(50) PRIMARY KEY, " +
                     "email VARCHAR(150) UNIQUE NOT NULL, " +
                     "password_hash VARCHAR(255) NOT NULL, " +
                     "name VARCHAR(100) NOT NULL, " +
                     "role VARCHAR(20) DEFAULT 'student')");

        // 5. Feedback
        stmt.execute("CREATE TABLE IF NOT EXISTS feedback (" +
                     "id VARCHAR(50) PRIMARY KEY, " +
                     "user_id VARCHAR(50) NULL, " +
                     "user_name VARCHAR(100) DEFAULT 'Anonymous Student', " +
                     "food_spot_id VARCHAR(50) NOT NULL, " +
                     "menu_item_id VARCHAR(100) NULL, " +
                     "menu_item_name VARCHAR(200) NULL, " +
                     "rating INTEGER NOT NULL, " +
                     "feedback_text TEXT NULL, " +
                     "is_recommended INTEGER DEFAULT 1, " +
                     "status VARCHAR(20) DEFAULT 'approved')");

        // 6. Favorites
        stmt.execute("CREATE TABLE IF NOT EXISTS favorites (" +
                     "id VARCHAR(50) PRIMARY KEY, " +
                     "user_id VARCHAR(50) NOT NULL, " +
                     "food_spot_id VARCHAR(50) NOT NULL, " +
                     "menu_item_id VARCHAR(100) NULL)");

        stmt.close();
    }

    public void insertFoodSpot(String id, String slug, String name, String locId, String zone,
                               String specLoc, String cats, String desc, String status,
                               String mustTry, String recBy, boolean isCounter, String sharedMenu) throws SQLException {
        String sql = "INSERT OR REPLACE INTO food_spots (id, slug, name, location_id, zone, specific_location, categories, description, status, must_try_item, recommended_by, is_counter_based, shared_menu_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setString(2, slug);
            ps.setString(3, name);
            ps.setString(4, locId);
            ps.setString(5, zone);
            ps.setString(6, specLoc);
            ps.setString(7, cats);
            ps.setString(8, desc);
            ps.setString(9, status);
            ps.setString(10, mustTry);
            ps.setString(11, recBy);
            ps.setInt(12, isCounter ? 1 : 0);
            ps.setString(13, sharedMenu);
            ps.executeUpdate();
        }
    }

    public void insertMenuItem(String id, String spotId, String counter, String name,
                               String category, Double price, String dietary, String variants, boolean mustTry) throws SQLException {
        String sql = "INSERT OR REPLACE INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, variants, is_must_try) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setString(2, spotId);
            ps.setString(3, counter);
            ps.setString(4, name);
            ps.setString(5, category);
            if (price != null) ps.setDouble(6, price); else ps.setNull(6, Types.DOUBLE);
            ps.setString(7, dietary);
            ps.setString(8, variants);
            ps.setInt(9, mustTry ? 1 : 0);
            ps.executeUpdate();
        }
    }

    public List<String> searchBudgetDishes(double maxBudget, String dietary) throws SQLException {
        List<String> results = new ArrayList<>();
        String sql = "SELECT m.name, m.price, m.dietary, f.name AS spot_name " +
                     "FROM menu_items m " +
                     "JOIN food_spots f ON m.food_spot_id = f.id " +
                     "WHERE m.price IS NOT NULL AND m.price <= ? ";
        if (dietary != null && !dietary.isEmpty()) {
            sql += "AND m.dietary = ? ";
        }
        sql += "ORDER BY m.price ASC LIMIT 10";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, maxBudget);
            if (dietary != null && !dietary.isEmpty()) {
                ps.setString(2, dietary);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(String.format("%s (Rs. %.0f) - %s [%s]",
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getString("spot_name"),
                        rs.getString("dietary")));
                }
            }
        }
        return results;
    }

    public void addFeedback(String id, String userId, String userName, String spotId, String dishId,
                            String dishName, int rating, String text) throws SQLException {
        String sql = "INSERT INTO feedback (id, user_id, user_name, food_spot_id, menu_item_id, menu_item_name, rating, feedback_text) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setString(2, userId);
            ps.setString(3, userName);
            ps.setString(4, spotId);
            ps.setString(5, dishId);
            ps.setString(6, dishName);
            ps.setInt(7, rating);
            ps.setString(8, text);
            ps.executeUpdate();
        }
    }

    public List<String> getStudentFavourites() throws SQLException {
        List<String> favs = new ArrayList<>();
        String sql = "SELECT f.name, COUNT(fb.id) AS review_count, AVG(fb.rating) AS avg_rating " +
                     "FROM food_spots f " +
                     "JOIN feedback fb ON f.id = fb.food_spot_id " +
                     "GROUP BY f.id, f.name " +
                     "HAVING COUNT(fb.id) >= 1 " +
                     "ORDER BY avg_rating DESC, review_count DESC LIMIT 5";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                favs.add(String.format("%s — Rating: %.1f/5 (%d reviews)",
                    rs.getString("name"),
                    rs.getDouble("avg_rating"),
                    rs.getInt("review_count")));
            }
        }
        return favs;
    }
}
