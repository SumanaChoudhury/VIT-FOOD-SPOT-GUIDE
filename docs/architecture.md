# System Architecture: VIT Food Spot Guide

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER (SPA)                                 |
|                                                                                   |
|   HTML5 Semantic Structure (Header, Nav, Main, Section, Article, Footer)         |
|   CSS3 (Responsive Grid, Box Model, Transitions, Media Queries)                   |
|   JavaScript & jQuery (DOM Events, AppState, Dynamic Ingestion, Debounced Search)  |
|   Interactive Widgets: Floating AI Chat Drawer, Filter Chips, Spot Detail Modals  |
+------------------------------------------+----------------------------------------+
                                           |
                                  HTTP / JSON (REST APIs)
                                  Fetch / jQuery AJAX
                                           |
+------------------------------------------v----------------------------------------+
|                                APPLICATION TIER (MVC)                             |
|                                                                                   |
|   Node.js v24 + Express.js Web Framework                                          |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | MIDDLEWARE LAYER                                                          |   |
|   |  - Express Rate Limiter (Chat & Auth DoS defense)                         |   |
|   |  - Express Session & Cookie Parser (HttpOnly, SameSite Session Security)  |   |
|   |  - Auth Middleware (Admin access control)                                 |   |
|   |  - Centralized Error Handler & 404 Interceptor                            |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|   +-------------------------------------v-------------------------------------+   |
|   | CONTROLLERS LAYER                                                         |   |
|   |  - foodSpotController       - locationController     - menuItemController |   |
|   |  - recommendationController - chatController         - adminController    |   |
|   |  - exportController (XML & CSV streaming)                                 |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|   +-------------------------------------v-------------------------------------+   |
|   | SERVICES & BUSINESS LOGIC LAYER                                           |   |
|   |  - recommendationEngine: Transparent scoring (Location + Category +       |   |
|   |                          Budget + Dietary + Must-Try Student Recs)        |   |
|   |  - aiService: Gemini LLM integration + Smart Rule-Based Engine Fallback   |   |
|   |  - importService: CSV/XLSX parser, citation scrubber, variant extractor   |   |
|   |  - eventEmitter: Node.js EventEmitter audit & event triggers              |   |
|   |  - dataStore: Unified Storage Abstraction Engine                          |   |
|   +-------------------------------------+-------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           |
                                  Mongoose ODM / File Sync
                                           |
+------------------------------------------v----------------------------------------+
|                                  STORAGE TIER                                     |
|                                                                                   |
|   Primary Database: MongoDB (Document collections with text & compound indexes)   |
|     - CampusLocations                                                             |
|     - FoodSpots (One Food World, Nescafe shared menu instances, Standalone)       |
|     - Counters (Al Beirut, Korean Wok Box, US Pizzeria, Texas Chicken, etc.)      |
|     - MenuItems (3,034 verified dishes, price variants, dietary classifications)  |
|     - Recommendations (Moderated student submissions)                             |
|     - Admins (Salted bcrypt credential hashes)                                    |
|                                                                                   |
|   Resilience Fallback: Local JSON Persistence Engine (`data/processed/datastore`) |
|                                                                                   |
|   Academic Companion Modules:                                                     |
|     - Relational JDBC: `DatabaseReportDemo.java` (SQL, Statement, ResultSet)     |
|     - Enterprise Java: `MenuReport.jsp` (Server-Side Java Rendering)              |
|     - XML Serialization: `foodspots.dtd` & `foodspots.xsd`                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Key Architectural Decisions

### 2.1 Decoupled Campus Relationship Model (Zero Fake GPS)
Instead of fabricating inaccurate GPS coordinates or walking times, the system models the physical reality of the VIT campus through verified proximity relationships:
```
SJT (Silver Jubilee Tower)
 ├── Directly located: Nama Chai, Lassi House, Hangy and Swig, Nescafe SJT
 ├── Adjacent (Score 30): PRP Block (Sri Sabari, Sri Sai Sabari)
 └── Close (Score 20): TT Block (DC, FC, Nescafe TT), Boys' Hostel (One Food World)
```

### 2.2 Hierarchical Food Court Decomposition (One Food World)
One Food World is strictly preserved as **ONE** physical location with 6 culinary counters:
$$\text{FoodSpot (One Food World)} \longrightarrow \text{Counters (6)} \longrightarrow \text{MenuItems (321 dishes)}$$

### 2.3 Normalized Menu Pointer Architecture (Nescafe)
Five separate physical Nescafe kiosks (Ladies' Hostel, Men's Hostel, TT, SJT, Library) share a single canonical menu definition via `sharedMenuId: 'nescafe_shared_menu'`, ensuring data integrity and zero redundancy.

### 2.4 Transparent Scoring Formula
$$\text{Score} = S_{\text{location}} (0-40) + S_{\text{category}} (0-20) + S_{\text{budget}} (0-20) + S_{\text{dietary}} (0-10) + S_{\text{recs}} (0-10)$$
Total maximum score is 100 points, guaranteeing transparent ranking.
