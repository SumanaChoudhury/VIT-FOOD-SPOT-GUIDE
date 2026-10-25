# Viva Voce Preparation Guide: VIT Food Spot Guide

This document prepares students for external and internal viva questions for the **Advanced Web Technology** laboratory and theory examinations.

---

## 1. Project Motivation & Scope
**Q: Why was this project chosen?**  
**A:** At VIT Vellore, freshers and seniors frequently do not know what food outlets exist near their current academic blocks (e.g., SJT, PRP, TT, MGB, GDN, SMV) or hostels. General apps like Zomato/Swiggy lack internal campus context, counter divisions (like One Food World), and student-vetted must-try dishes. This project provides a location-based discovery platform built specifically around verified campus datasets.

---

## 2. Architecture & Technologies
**Q: Why Node.js and Express for the backend?**  
**A:** Node.js provides a high-throughput, non-blocking asynchronous event-driven runtime ideal for I/O-heavy REST APIs. Express.js is a minimalist web framework offering robust middleware chaining, route modularity, and seamless JSON serialization.

**Q: Why MongoDB over a relational database?**  
**A:** Campus food menus exhibit polymorphic schemas: some dishes have size variants (Regular/Medium/Large), others have single prices, some have counter references, and others have missing prices. MongoDB’s BSON document model flexibly accommodates these structures without rigid `NULL` columns or costly multi-table SQL joins.

**Q: Why is Single Page Application (SPA) architecture used?**  
**A:** SPA eliminates redundant full-page browser reloads. Filtering by budget, searching 3,000+ dishes, opening spot menus, and chatting with the AI occur instantly in-place via AJAX and DOM updates, providing a smooth user experience.

---

## 3. Communication & Data Representation
**Q: What is REST? How does the frontend communicate with the backend?**  
**A:** Representational State Transfer (REST) is an architectural style utilizing standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) operating on stateless resource URIs (`/api/food-spots`, `/api/menu-items`). The client uses modern Fetch API and jQuery AJAX to transmit asynchronous HTTP requests and receive structured JSON payloads.

**Q: What is JSON and why is it preferred over XML for client communication?**  
**A:** JavaScript Object Notation (JSON) is lightweight, text-based, and maps directly to native JavaScript data structures without complex DOM parsing overhead.

---

## 4. Algorithms & Data Integrity
**Q: How does the location recommendation engine score food spots?**  
**A:** A transparent multi-factor scoring formula calculates a score out of 100 points:
$$\text{Score} = \text{Location Proximity (0-40)} + \text{Category Match (0-20)} + \text{Budget Match (0-20)} + \text{Dietary Match (0-10)} + \text{Student Recommendation Boost (0-10)}$$
Direct block matches score 40, adjacent blocks score 30, and close blocks score 20.

**Q: How are missing prices handled? Why not default them to ₹0?**  
**A:** If a price is unavailable, it is strictly stored as `price: null` and displayed as *"Price not listed"*. Defaulting to ₹0 would cause unpriced dishes to appear in "Under ₹50" budget searches, corrupting search integrity.

**Q: How is One Food World modeled?**  
**A:** One Food World is modeled as **one** physical food spot linked to 6 culinary counters (Al Beirut, Korean Wok Box, Hollywood Thick Shake Bar, US Pizzeria, Texas Fried Chicken, Fried Chicken & Burgers). Dishes link to their respective counter name.

**Q: How is Nescafe modeled?**  
**A:** 5 physical Nescafe locations exist on campus (LH, MH, TT, SJT, Library). Rather than duplicating 32 dishes 5 times, all 5 spots point to a single canonical dataset via `sharedMenuId: 'nescafe_shared_menu'`.

---

## 5. AI Chatbot & Fallback
**Q: How does the AI chatbot work without hallucinating?**  
**A:** The chatbot uses database grounding. The user query is analyzed for location, budget, and dish entities; matching database records are extracted and injected as system context into the LLM prompt. The system strictly forbids hallucination. If no match exists, it replies: *"I couldn't find that in the current VIT Food Spot Guide data."*

**Q: What happens if the external AI service fails or the API key is missing?**  
**A:** The system automatically triggers the built-in **Rule-Based Recommendation Engine** (`server/services/aiService.js`). It extracts intents via regex and queries the verified database directly, ensuring 100% service availability.

---

## 6. Authentication, Sessions & Security
**Q: How are administrator sessions managed?**  
**A:** On successful login, the server hashes the password with `bcryptjs`, creates a session record via `express-session`, and issues a cryptographically signed cookie (`connect.sid`). The cookie is marked `HttpOnly` (preventing theft via XSS) and `SameSite=lax` (preventing CSRF).

**Q: What security measures protect against abuse?**  
**A:** 
1. Password hashing with salted bcrypt.
2. Express rate limiting on auth and chat routes to block brute-force and DoS.
3. Input sanitization and regex validation.
4. AI API keys stored strictly in `.env` on the server.

---

## 7. Academic Demonstrations & Syllabus Mapping
**Q: Why are JDBC and JSP included if MongoDB and Node.js are used?**  
**A:** Modules 6 and 7 of the university syllabus require practical evidence of JavaServer Pages (JSP) and relational database access (JDBC). We implemented companion academic modules: `MenuReport.jsp` for server-side Java rendering, and `DatabaseReportDemo.java` demonstrating standard JDBC connection, SQL statements, and ResultSet traversal.

**Q: What is the difference between DTD and XML Schema (XSD)?**  
**A:** 
- **DTD** uses proprietary non-XML syntax, has text-only typing (`#PCDATA`), and lacks namespace support.
- **XSD** uses standard XML syntax, supports strong data typing (`xs:dateTime`, `xs:nonNegativeInteger`), facets, and namespaces.
Both are demonstrated in `academic-demos/xml/foodspots.dtd` and `academic-demos/xml/foodspots.xsd`.

**Q: What is the DOM? Why use jQuery?**  
**A:** The Document Object Model (DOM) is the tree representation of an HTML document in browser memory. jQuery abstracts cross-browser DOM manipulation, event handling, and AJAX into concise method chains (e.g. `$(selector).slideDown()`).

**Q: How would this application scale beyond a college project?**  
**A:**
1. Horizontal stateless scaling of Node.js instances behind an Nginx reverse proxy.
2. Redis caching for frequent search queries and session storage.
3. MongoDB replica sets with read preference routing.
4. CDN caching for static frontend assets.

---

## 8. Product Philosophy & User Experience Design
**Q: Why does the homepage focus purely on Food Spots rather than showing syllabus module cards?**  
**A:** The syllabus outlines the technical constraints and engineering competencies required for the course (such as HTML5 semantics, CSS3 responsive grid, DOM scripting, RESTful APIs, express sessions, XML, JSP, JDBC, and MongoDB). In professional software engineering, these competencies form the technical foundation of the product, not the consumer-facing content. A student using the app wants to discover food spots, browse menus, and find dishes within their budget. Presenting academic syllabus cards on the main interface would degrade UX and product authenticity. All required academic demonstrations remain fully functional in the codebase and dedicated companion modules (`academic-demos/`).
