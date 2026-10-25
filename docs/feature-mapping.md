# Feature Mapping: VIT Food Spot Guide

This document maps all business and course requirements to the implemented architecture, files, endpoints, and UI views.

| Feature ID | Feature Name | Frontend View / Component | Backend Route / Controller | Database Model / Service |
|---|---|---|---|---|
| **F-01** | Campus Location Discovery | `client/index.html` (#location-section), `client/js/app.js` | `GET /api/locations`<br>`GET /api/food-spots/nearby` | `models/CampusLocation.js`<br>`services/recommendationEngine.js` |
| **F-02** | Food Spot Directory & Filtering | `client/index.html` (#directory-section), `client/js/app.js` | `GET /api/food-spots`<br>`GET /api/food-spots/:id` | `models/FoodSpot.js`<br>`controllers/foodSpotController.js` |
| **F-03** | Outlet Details & Menu Explorer | `client/index.html` (#spot-detail-modal), `client/js/app.js` | `GET /api/food-spots/:id`<br>`GET /api/menu-items?foodSpot=:id` | `models/FoodSpot.js`<br>`models/MenuItem.js` |
| **F-04** | One Food World Multi-Counter | `client/index.html` (#counter-tabs), `client/js/app.js` | `GET /api/food-spots/:ofwId/counters`<br>`GET /api/menu-items?counter=:id` | `models/Counter.js`<br>`models/FoodSpot.js` |
| **F-05** | Nescafe Shared Menu Architecture | `client/index.html` (#nescafe-locations), `client/js/app.js` | `GET /api/food-spots?group=nescafe` | `models/FoodSpot.js`<br>`models/MenuItem.js` |
| **F-06** | Real-Time Dish Search | `client/index.html` (#dish-search-input), `client/js/app.js` | `GET /api/menu-items/search?q=:query` | `models/MenuItem.js`<br>`controllers/menuItemController.js` |
| **F-07** | Pocket Budget Filter | `client/index.html` (#budget-filter-pills), `client/js/app.js` | `GET /api/menu-items?maxPrice=:price` | `models/MenuItem.js`<br>`services/recommendationEngine.js` |
| **F-08** | Dietary Classification (Veg/Non-Veg) | `client/index.html` (#dietary-toggle), `client/js/app.js` | `GET /api/menu-items?dietary=:type` | `models/MenuItem.js`<br>`services/importService.js` |
| **F-09** | Student Recommendations & Must-Try | `client/index.html` (#recommendations-section), `client/js/app.js` | `GET /api/recommendations`<br>`POST /api/recommendations` | `models/Recommendation.js`<br>`controllers/recommendationController.js` |
| **F-10** | Recommendation Moderation Queue | `client/index.html` (#admin-moderation-tab), `client/js/admin.js` | `GET /api/admin/recommendations`<br>`PATCH /api/admin/recommendations/:id` | `models/Recommendation.js`<br>`controllers/adminController.js` |
| **F-11** | AI Recommendation Chatbot | `client/index.html` (#ai-chat-drawer), `client/js/chat.js` | `POST /api/chat` | `services/aiService.js`<br>`services/recommendationEngine.js` |
| **F-12** | AI Fallback Engine | `client/js/chat.js` (transparent badge) | `POST /api/chat` (handles failover) | `services/aiService.js` (rule-based fallback) |
| **F-13** | Admin Authentication & Sessions | `client/index.html` (#admin-login-modal), `client/js/admin.js` | `POST /api/admin/login`<br>`POST /api/admin/logout`<br>`GET /api/admin/session` | `models/Admin.js`<br>`middleware/auth.js` |
| **F-14** | Menu CSV/XLSX Ingestion Pipeline | `client/index.html` (#admin-import-tab), `client/js/admin.js` | `POST /api/admin/import` | `services/importService.js`<br>`scripts/import-menus.js` |
| **F-15** | Data Quality Dashboard & Audit | `client/index.html` (#admin-quality-tab), `client/js/admin.js` | `GET /api/admin/data-quality` | `services/dataQualityService.js`<br>`docs/data-quality-report.md` |
| **F-16** | XML / DTD / XSD Export & Validation | `academic-demos/xml/sample-foodspots.xml`, `client/js/app.js` | `GET /api/export/xml` | `utils/xmlGenerator.js`<br>`academic-demos/xml/` |
| **F-17** | JSP Companion Server-Side Report | `academic-demos/jsp/MenuReport.jsp` | Standalone JSP servlet / script | `academic-demos/jsp/` |
| **F-18** | JDBC Relational Demo Connector | `academic-demos/jdbc/DatabaseReportDemo.java` | Standalone Java JDBC application | `academic-demos/jdbc/` |
| **F-19** | HTML5 Interactive Campus Image Map | `academic-demos/imagemap/campus-imagemap.html`, `client/index.html` | Client-side HTML5 `<map><area>` | `academic-demos/imagemap/` |
| **F-20** | HTML Frames vs. Modern Iframes | `academic-demos/frames/modern-iframe.html`, `academic-demos/frames/legacy-frameset.html` | Client-side comparative demo | `academic-demos/frames/` |
| **F-21** | Node.js EventEmitter Lifecycle | Server background event triggers | Node.js internal `events` | `server/utils/eventEmitter.js` |
| **F-22** | Responsive Mobile / Tablet / Desktop | CSS Grid, Flexbox, Media Queries | `client/css/style.css`<br>`client/css/responsive.css` | Accessible Mobile-First UI |
