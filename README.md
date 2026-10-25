# VIT Food Spot Guide
### An AI-Powered, Location-Based Campus Food Discovery and Recommendation System

[![Node.js Version](https://img.shields.io/badge/Node.js-v24.16.0-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2B%20JDBC%20Relational-blue.svg)](scripts/schema.sql)
[![Java Version](https://img.shields.io/badge/Java-JDK%2021%20LTS-orange.svg)](academic-demos/jdbc/)
[![Tests Status](https://img.shields.io/badge/Tests-30%20Passed%20%2F%200%20Failed-brightgreen.svg)](docs/testing-report.md)
[![Theme](https://img.shields.io/badge/Theme-Light%20Blue%20%26%20White-sky.svg)](client/css/style.css)

---

## 1. Project Overview
**VIT Food Spot Guide** is an authentic, location-based campus food discovery web application tailored specifically for students at **Vellore Institute of Technology (VIT Vellore)**.

The application revolves around **Food Spots and Food Discovery**:
- Discover verified campus food outlets organized strictly by student zones (**Boys' Hostel**, **Girls' Hostel**, **Academic Blocks**, **Cafes Around VIT**).
- Search individual dishes across 3,300+ verified menu records.
- Filter by pocket budget (e.g. Under ₹50, ₹100, ₹150) and dietary preferences (Vegetarian / Non-Vegetarian).
- Navigate One Food World (OFW) and its 6 individual counters.
- Block-by-block academic navigation (PRP, SJT, MGB, TT, GDN, SMV & Library).
- AI Campus Food Chatbot with Grok API integration and short, simple sentence answers.
- Student account registration strictly enforcing VIT student emails (`firstname.lastname@vitstudent.ac.in`).
- Save personal favorites and post community reviews that dynamically drive "Student Favourite" rankings.

---

## 2. Key Modules & Navigation
The application features a modern **Light Blue + Pure White** theme with dedicated Single Page Application (SPA) navigation modules:

1. **Explore**: The primary food discovery grid showing 32 verified campus spots, pocket budget pills, dietary toggles, real-time dish search, and interactive favorite heart buttons.
2. **Men's Hostel**: Dedicated view for Boys' Hostel dining places:
   - **One Food World** spotlight detailing all 6 culinary counters (*Al Beirut*, *Korean Wok Box*, *Hollywood Thick Shake Bar*, *US Pizzeria*, *Texas Fried Chicken*, *Fried Chicken & Burgers*).
   - *Just Bake* (Commercial Arcade).
   - *Nescafe (Men's Hostel)* sharing the canonical campus menu.
3. **Ladies' Hostel**: Dedicated view for Girls' Hostel dining places:
   - *Good Vibes* (clearly labeled *"Menu information not available yet"*).
   - *Aunty's Mess* (famous for fresh egg varieties, onion omelettes, dosas, and parottas).
   - *Nescafe (Ladies' Hostel)* sharing the canonical campus menu.
   - *Fruit Juice Shop* (fresh seasonal fruit juices, chillers, and badam milk).
4. **Academic Block**: Interactive block selector for PRP, SJT, MGB, TT, GDN, and SMV/Library showing food spots inside the building plus nearby spots per the campus map.
5. **AI Chatbot**: Dedicated assistant powered by Grok AI delivering short, simple sentences strictly grounded in verified database data.
6. **Feedback**: Community reviews and dynamic "Student Favourite" scores calculated via SQL aggregation (`AVG(rating)` and `COUNT(*)`).
7. **Favorites**: Bookmarked food spots and dishes saved in the relational database per student account.
8. **Login / Register**: Strict regex validation: `firstname.lastname@vitstudent.ac.in` with bcrypt password hashing.
9. **Admin Portal**: Discreet portal for database quality audits, moderation, and menu imports.

---

## 3. Database Architecture (MySQL + Java JDBC)
In accordance with course syllabus Module 7 requirements:
- **Primary Database Engine**: MySQL (`vit_food_spots` relational database).
- **Relational Tables**:
  - `locations`: Campus blocks, hostels, hubs, and proximity relationships.
  - `food_spots`: Food spot master directory with zones, locations, must-try items, and status.
  - `menu_items`: 3,368 real menu items with foreign keys to `food_spots`, prices, dietary tags, and variants.
  - `users`: Student accounts with strict VIT email regex and bcrypt hashes.
  - `feedback`: Student ratings and reviews driving dynamic student picks.
  - `favorites`: User-specific bookmarks.
- **Java JDBC Layer**: Executable standalone JDBC class (`DatabaseReportDemo.java`) compiling with JDK 21 LTS using `mysql-connector-j-8.4.0.jar` and `sqlite-jdbc-3.45.2.0.jar` auto-fallback.
- **Node.js Dual Driver**: Connects directly to MySQL via `mysql2/promise` when available, with seamless built-in relational SQLite fallback (`node:sqlite`) for zero-crash evaluation on machines without a running MySQL daemon.

---

## 4. Added General Menus
The following verified datasets have been imported into the relational database:
- **Amul**: Scoop ice creams, cones, cups, and packaged ice cream bars without fabricated prices.
- **Sugarcane Juice**: Sugarcane (₹35), Sugarcane with Lime (₹40), Tender Coconut (₹60).
- **Aavin Tea Stall**: Tea (₹12), Coffee (₹15), Boost (₹20), Horlicks (₹20), Badam Milk (₹40), Bottled Sambara (₹15).
- **Nescafe (Men's Hostel)**: Linked to canonical Nescafe menu shared across LH, MH, TT, SJT, and Library.
- **Unlisted Outlets**: FC, Good Vibes, Margerita, and Darling Main Canteen clearly display *"Menu information not available yet"*.

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v24.16.0)
- Java JDK 17 or 21 (optional for Java JDBC demo)
- MySQL Server (optional; auto-fallback provided)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Seed the Relational Database
```powershell
npm run seed
```

### Step 3: Start the Web Application
```powershell
npm start
```
Open **`http://localhost:5000`** in any web browser.

### Step 4: Run the Automated 30-Point Test Suite
```powershell
npm test
```

### Step 5: Run the Java JDBC Demonstration (Module 7)
```powershell
javac -cp "academic-demos\jdbc\mysql-connector-j-8.4.0.jar;academic-demos\jdbc\sqlite-jdbc-3.45.2.0.jar;academic-demos\jdbc\slf4j-api-2.0.12.jar;academic-demos\jdbc\slf4j-simple-2.0.12.jar" academic-demos\jdbc\DatabaseReportDemo.java academic-demos\jdbc\DBConnection.java academic-demos\jdbc\CampusFoodDB.java
java -cp "academic-demos\jdbc;academic-demos\jdbc\mysql-connector-j-8.4.0.jar;academic-demos\jdbc\sqlite-jdbc-3.45.2.0.jar;academic-demos\jdbc\slf4j-api-2.0.12.jar;academic-demos\jdbc\slf4j-simple-2.0.12.jar" DatabaseReportDemo
```

---

## 6. Verification & Test Summary
Full 30-point test suite in `tests/test-suite.js`:
- **30 Tests Passed / 0 Failed (100% Pass Rate)**
- Detailed execution logs: [`docs/testing-report.md`](docs/testing-report.md)
