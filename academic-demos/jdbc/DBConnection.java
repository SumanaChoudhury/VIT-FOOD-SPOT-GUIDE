package jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * VIT Food Spot Guide — Relational Database Connection Manager
 * 
 * Supports:
 * 1. Primary: MySQL Server via MySQL Connector/J (com.mysql.cj.jdbc.Driver)
 * 2. Fallback: Relational SQLite via SQLite JDBC (org.sqlite.JDBC)
 */
public class DBConnection {

    private static final String MYSQL_HOST = System.getenv("MYSQL_HOST") != null ? System.getenv("MYSQL_HOST") : "127.0.0.1";
    private static final String MYSQL_PORT = System.getenv("MYSQL_PORT") != null ? System.getenv("MYSQL_PORT") : "3306";
    private static final String MYSQL_DB   = System.getenv("MYSQL_DATABASE") != null ? System.getenv("MYSQL_DATABASE") : "vit_food_spots";
    private static final String MYSQL_USER = System.getenv("MYSQL_USER") != null ? System.getenv("MYSQL_USER") : "root";
    private static final String MYSQL_PASS = System.getenv("MYSQL_PASSWORD") != null ? System.getenv("MYSQL_PASSWORD") : "";

    private static final String SQLITE_FILE = "data/vit_food_spots.db";

    public static Connection getConnection() throws SQLException {
        // First try MySQL JDBC Connection
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String mysqlUrl = "jdbc:mysql://" + MYSQL_HOST + ":" + MYSQL_PORT + "/" + MYSQL_DB + 
                              "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            Connection conn = DriverManager.getConnection(mysqlUrl, MYSQL_USER, MYSQL_PASS);
            return conn;
        } catch (Exception mysqlEx) {
            // Fallback to SQLite JDBC for zero-dependency execution
            try {
                Class.forName("org.sqlite.JDBC");
                String sqliteUrl = "jdbc:sqlite:" + SQLITE_FILE;
                return DriverManager.getConnection(sqliteUrl);
            } catch (Exception sqliteEx) {
                // If file-based fails, try in-memory SQLite JDBC
                try {
                    Class.forName("org.sqlite.JDBC");
                    return DriverManager.getConnection("jdbc:sqlite::memory:");
                } catch (ClassNotFoundException cnf) {
                    throw new SQLException("No JDBC driver found. Please ensure mysql-connector-j or sqlite-jdbc is in classpath.");
                }
            }
        }
    }
}
