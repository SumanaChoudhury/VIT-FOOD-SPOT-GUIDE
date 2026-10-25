# Requirements Analysis: VIT Food Spot Guide

## 1. Project Overview & Context
- **Title**: VIT Food Spot Guide: An AI-Powered, Location-Based Campus Food Discovery and Recommendation System
- **Institution**: Vellore Institute of Technology (VIT), Vellore
- **Target Audience**: VIT students (freshers, seniors, day scholars, hostellers) navigating food options across campus.
- **Academic Context**: Advanced Web Technology Course Project covering Modules 1 through 7 of the university curriculum.

---

## 2. Problem Statement
Freshers and seniors at VIT often struggle with campus dining:
1. They do not know what food outlets exist near their current academic block (e.g. SJT, PRP, TT, MGB, GDN, SMV) or hostel block.
2. Generic food apps (Zomato/Swiggy/Google) lack campus-internal context, exact block proximities, counter setups (like One Food World), and student-vetted must-try dishes.
3. Students on a strict pocket budget cannot easily filter verified dishes under specific price points (e.g., ₹50, ₹100, ₹150).
4. Menu data is dispersed, unstandardized, and frequently outdated.

---

## 3. Verified Outlets & Campus Entity Analysis

### Academic Block Cluster
- **SJT (Silver Jubilee Tower)**: Nama Chai, Lassi House, Hangy and Swig, Nescafe SJT.
- **PRP (Periyar EVR Central Block)**: Sri Sabari (Cafe / Pasta / Fast Food), Sri Sai Sabari (Chaat / Dining).
- **TT (Technology Tower)**: DC (Darling Cafe near TT), FC (Food Court near TT), Nescafe TT.
- **MGB (Mahatma Gandhi Block)**: Darling Cafe (MGB) — separate physical entity from TT DC and GDN Canteen.
- **GDN (G.D. Naidu Block)**: Darling Main Canteen, Aavin Tea Stall (GDN only).
- **SMV (Sir M. Visvesvaraya Building)**: Amul stall, Sugarcane Juice stall.
- **Main Block & Library**: Central Library Nescafe, Madras Coffee House.
- **Campus Academic Corridors**: Olives (waffles/desserts), Arasan (multi-counter), Flora, Domino's, Garnish.

### Hostel Clusters
- **Ladies' Hostel Area**: Aunty's Mess, Good Vibes, Nescafe LH, Apples (LH Fruit Juice).
- **Boys' Hostel Area**: One Food World (with 6 counters), Just Bake, Nescafe MH.

### Hubs & Gazebos
- **KC Food & Gazebos**: KC Food, Imperial Goli Soda, Chole Bhature stall, Wai Wai noodles stall.

---

## 4. Complex Data Architecture Requirements

### 4.1 One Food World Multi-Counter Model
One Food World is a **single physical food court** housing 6 distinct branded counters:
1. Al Beirut (Hummus, Rolls, Shawarma, BBQ, Combos)
2. Korean Wok Box (Manchurian, Dragon, Schezwan Kung Pao, Seoul Rice & Noodles)
3. Hollywood Thick Shake Bar (Shakes, Juices, Sundaes, Sandwiches, Cold Coffee)
4. US Pizzeria (Pizza, Burgers, Calzone, Lasagna, Pasta, Nachos)
5. Texas Fried Chicken (Fried Chicken, Combos, Party Packs)
6. Fried Chicken & Burgers (Burgers, Wraps, Meal Packs, Crispy Eats)

### 4.2 Nescafe Shared Menu Architecture
Five distinct physical locations share the exact same standardized menu:
1. Ladies' Hostel
2. Men's Hostel
3. TT
4. SJT
5. Library
The database models each as an independent discovery point while referencing a shared canonical menu dataset to prevent 5x data redundancy.

---

## 5. Functional Requirements (FR)
- **FR-01: Location-Based Food Discovery**: Filter and rank food spots relative to user's selected campus block/hostel.
- **FR-02: Outlet Directory & Profile View**: Outlet details, verification status, counters, category tags, must-try items, and menu status.
- **FR-03: Dish-Level Search**: Real-time cross-outlet search for dishes (e.g., "maggi", "paneer roll", "cold coffee", "dosa").
- **FR-04: Pocket Budget Discovery**: Filter items by price tiers (Under ₹50, ₹50-₹100, ₹100-₹150, ₹150-₹250, custom range). Missing prices are never assumed to be ₹0.
- **FR-05: Dietary Classification**: Filter vegetarian, non-vegetarian, and vegan dishes with transparent classification sources (`explicit`, `inferred`, `unknown`).
- **FR-06: Student Recommendations**: Submission of student picks with recommendation categories, anonymous/alias submission, and admin moderation queue (`pending`, `approved`, `rejected`).
- **FR-07: AI Campus Chatbot**: Natural language query processing grounded strictly on database records with automatic fallback to rule-based engine upon AI outage.
- **FR-08: Administrative Management**: Authenticated dashboard with secure session cookies and password hashing for outlet, location, menu, and submission moderation.
- **FR-09: Data Import & Quality Control**: Automated ingestion of CSV and XLSX datasets with duplicate elimination, price parsing, and data quality metrics.
- **FR-10: Academic Demos**: HTML5 Image Map, HTML legacy frames vs. modern iframes demonstration, XML/DTD/XSD export and validation, JSP companion report view, and JDBC data connector demonstration.

---

## 6. Non-Functional Requirements (NFR)
- **Performance**: Sub-200ms API response time, efficient in-memory indexing, responsive client rendering.
- **Security**: No plaintext passwords (bcryptjs), secure HTTP cookies (`HttpOnly`, `SameSite=lax`), input sanitization, API rate limiting, AI API keys kept server-side only.
- **Reliability & Fallback**: System functions 100% offline or without external AI keys via rule-based inference. Database layer supports both live MongoDB and file-backed fallback.
- **Usability & Design**: VIT-focused design system, responsive mobile/tablet/desktop layouts, high-contrast accessible typography, semantic HTML5, clear loading and empty states.
