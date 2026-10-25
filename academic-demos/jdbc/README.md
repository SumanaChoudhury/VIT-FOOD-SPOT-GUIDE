# Module 7: Java Database Connectivity (JDBC) & Relational Storage Layer

## Overview
This module demonstrates **Module 7 (Storage - Java Database Connectivity / JDBC)** of the Advanced Web Technology course syllabus.

In accordance with the project requirements:
1. **Primary Database**: MySQL Server (`vit_food_spots` relational database).
2. **Connectivity API**: JDBC (`java.sql.*`, `com.mysql.cj.jdbc.Driver`).
3. **Execution Resilience**: Relational SQLite JDBC fallback (`org.sqlite.JDBC`) when MySQL daemon is not running on the evaluator's machine, guaranteeing zero-crash execution under all evaluation conditions.
4. **Relational Architecture**:
   - `food_spots`
   - `menu_items`
   - `locations`
   - `users`
   - `feedback`
   - `favorites`

---

## How to Compile and Run the JDBC Demonstration

### Prerequisites
- Java JDK 17 or 21 (Installed on machine)
- Bundled JARs in `academic-demos/jdbc`:
  - `mysql-connector-j-8.4.0.jar`
  - `sqlite-jdbc-3.45.2.0.jar`
  - `slf4j-api-2.0.12.jar`
  - `slf4j-simple-2.0.12.jar`

### Compile
```powershell
javac -cp "academic-demos\jdbc\mysql-connector-j-8.4.0.jar;academic-demos\jdbc\sqlite-jdbc-3.45.2.0.jar;academic-demos\jdbc\slf4j-api-2.0.12.jar;academic-demos\jdbc\slf4j-simple-2.0.12.jar" academic-demos\jdbc\DatabaseReportDemo.java academic-demos\jdbc\DBConnection.java academic-demos\jdbc\CampusFoodDB.java
```

### Run
```powershell
java -cp "academic-demos\jdbc;academic-demos\jdbc\mysql-connector-j-8.4.0.jar;academic-demos\jdbc\sqlite-jdbc-3.45.2.0.jar;academic-demos\jdbc\slf4j-api-2.0.12.jar;academic-demos\jdbc\slf4j-simple-2.0.12.jar" DatabaseReportDemo
```

---

## Demonstrated Syllabus Concepts
- **`DriverManager.getConnection(url, user, password)`**: Establishes database session.
- **`Statement.execute(ddl)`**: Executes relational table creation with foreign keys and data types.
- **`PreparedStatement`**: Parameterized SQL queries preventing SQL injection attacks.
- **`ResultSet`**: Pointer-based traversal through query records (`rs.next()`, `rs.getString()`, `rs.getDouble()`).
- **SQL Aggregate Functions**: `AVG(rating)` and `COUNT(*)` calculating dynamic student food spot recommendations.
- **Transaction & Resource Management**: Clean `close()` calls on ResultSets, Statements, and Connections.
