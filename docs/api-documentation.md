# REST API Documentation: VIT Food Spot Guide

Base URL: `http://localhost:5000/api`

---

## 1. Food Spot Endpoints

### 1.1 List All Food Spots
- **Endpoint**: `GET /api/food-spots`
- **Query Parameters**:
  - `zone` (optional): Filter by zone (`Academic Blocks`, `Ladies' Hostel`, `Boys' Hostel`, `Other Food Spots`)
  - `location` (optional): Location slug (`sjt`, `prp`, `tt`, etc.)
  - `category` (optional): Category filter (`Beverages`, `Fast Food`, etc.)
  - `search` (optional): Keyword search for outlet name
  - `group` (optional): `nescafe` to retrieve all 5 shared-menu Nescafe outlets
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 32,
  "data": [
    {
      "_id": "spot_nama-chai",
      "name": "Nama Chai",
      "slug": "nama-chai",
      "location": "sjt",
      "zone": "Academic Blocks",
      "specificLocation": "Ground Floor / SJT Academic Area",
      "categories": ["Beverages", "Chai", "Tea", "Snacks"],
      "menuStatus": "available",
      "mustTryItem": "NC Special Chai",
      "menuItemCount": 19
    }
  ]
}
```

### 1.2 Get Food Spot Details
- **Endpoint**: `GET /api/food-spots/:id`
- **Parameters**: `id` can be an ObjectId or slug (`nama-chai`, `one-food-world`)
- **Response**: `200 OK` (includes counters, full menu, recommendations)

### 1.3 Location-Based Scoring Recommendation
- **Endpoint**: `GET /api/food-spots/nearby`
- **Query Parameters**:
  - `location`: user's location slug (e.g. `sjt`)
  - `maxBudget`: numeric pocket budget (e.g. `100`)
  - `dietary`: `veg` or `non-veg`
  - `category`: category filter
- **Response**: `200 OK` (sorted by transparent recommendation score out of 100)

---

## 2. Menu Items & Dish Search Endpoints

### 2.1 Search Dishes Across Campus
- **Endpoint**: `GET /api/menu-items/search`
- **Query Parameters**:
  - `q` (required): Dish keyword (e.g. `maggi`, `pasta`, `chai`, `biryani`)
  - `maxPrice` (optional): Maximum numeric budget
  - `dietary` (optional): `veg` or `non-veg`
- **Response**: `200 OK`
```json
{
  "success": true,
  "query": "chai",
  "total": 12,
  "data": [
    {
      "name": "NC Special Chai",
      "price": 30,
      "foodClassification": "veg",
      "spotName": "Nama Chai",
      "spotLocation": "Ground Floor / SJT Academic Area"
    }
  ]
}
```

### 2.2 List Menu Items (Paginated)
- **Endpoint**: `GET /api/menu-items`
- **Query Parameters**: `foodSpot`, `counter`, `category`, `maxPrice`, `minPrice`, `dietary`, `limit`, `skip`

---

## 3. Student Recommendations Endpoints

### 3.1 Get Approved Recommendations
- **Endpoint**: `GET /api/recommendations`
- **Query Parameters**: `category`, `foodSpot`

### 3.2 Submit a Recommendation
- **Endpoint**: `POST /api/recommendations`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "foodSpot": "spot_nama-chai",
  "dishName": "NC Special Chai",
  "category": "Must Try",
  "text": "Best cardamom tea on campus!",
  "displayName": "Pavithra K.",
  "anonymous": false
}
```
- **Response**: `201 Created` (status: `"pending"`)

---

## 4. AI Campus Chatbot Endpoint

### 4.1 Chat Query
- **Endpoint**: `POST /api/chat`
- **Rate Limit**: 30 requests per minute per IP
- **Request Body**:
```json
{
  "message": "I'm at SJT with ₹100. What should I eat?"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "reply": "Here are recommendations near SJT under ₹100...",
  "provider": "rule-based-engine",
  "verifiedDataOnly": true
}
```

---

## 5. Administrative Endpoints (Protected by Session)

### 5.1 Admin Login
- **Endpoint**: `POST /api/admin/login`
- **Request Body**: `{ "username": "admin", "password": "..." }`
- **Response**: `200 OK` with `Set-Cookie: connect.sid=...; HttpOnly; SameSite=Lax`

### 5.2 Admin Session Status
- **Endpoint**: `GET /api/admin/session`

### 5.3 Live Data Quality Audit
- **Endpoint**: `GET /api/admin/data-quality`

### 5.4 Moderation Queue
- **Endpoint**: `GET /api/admin/recommendations?status=pending`
- **Endpoint**: `PATCH /api/admin/recommendations/:id` with `{ "status": "approved" | "rejected" }`

### 5.5 Menu Ingestion (Multipart)
- **Endpoint**: `POST /api/admin/import`
- **Form Data**: `foodSpotSlug` (string), `datasetFile` (CSV or XLSX binary file)

---

## 6. Export & Health Endpoints

### 6.1 XML Export
- **Endpoint**: `GET /api/export/xml`
- **Response**: Content-Type: `application/xml` (conforms to `foodspots.dtd` and `foodspots.xsd`)

### 6.2 CSV Export
- **Endpoint**: `GET /api/export/csv`

### 6.3 Health Status
- **Endpoint**: `GET /api/export/health` or `GET /api/health`
