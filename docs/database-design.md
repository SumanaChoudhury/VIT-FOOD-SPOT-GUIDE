# Database Design: VIT Food Spot Guide

## 1. Overview & Data Architecture
The **VIT Food Spot Guide** uses **MongoDB** as its primary document-oriented NoSQL database, paired with **Mongoose** as the Object Data Modeling (ODM) layer in Node.js.

The database design satisfies complex campus-specific relationship constraints:
1. **Physical Campus Hierarchy**: Decoupled from arbitrary coordinates, modeled via explicit entity proximity (`adjacent`, `close`, `moderate`).
2. **One Food World Model**: 1 physical food court housing 6 independent branded counters (`FoodSpot` $\rightarrow$ `Counter` $\rightarrow$ `MenuItem`).
3. **Nescafe Shared Menu Architecture**: 5 distinct physical food spots referencing a single normalized menu dataset to prevent 5x data redundancy.
4. **Resilient Persistence**: The storage service (`server/services/dataStore.js`) interfaces natively with MongoDB and provides zero-config file-backed JSON synchronization for offline student environments.

---

## 2. Collections & Entity Schemas

### 2.1 `CampusLocation` (`models/CampusLocation.js`)
Represents physical campus hubs, academic blocks, and hostel blocks.
```javascript
{
  _id: ObjectId,
  name: String,             // e.g., "SJT (Silver Jubilee Tower)"
  slug: String,             // e.g., "sjt" (unique index)
  type: String,             // 'academic_block' | 'hostel' | 'library' | 'central_hub'
  parent: String,           // "VIT Vellore Campus"
  relationships: [{
    nearbyLocation: String, // foreign slug
    proximityLevel: String  // 'adjacent' | 'close' | 'moderate'
  }],
  coordinates: {
    verified: Boolean,      // false (honest reporting, no fake GPS)
    note: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 `FoodSpot` (`models/FoodSpot.js`)
Represents verified campus dining outlets.
```javascript
{
  _id: ObjectId,
  name: String,             // e.g., "One Food World", "Nama Chai"
  slug: String,             // e.g., "one-food-world" (unique index)
  location: String,         // CampusLocation slug (e.g. "sjt")
  campusLocationId: ObjectId,
  zone: String,             // "Academic Blocks" | "Ladies' Hostel" | "Boys' Hostel" | "Other Food Spots"
  specificLocation: String, // e.g., "Men's Hostel Central Quadrangle"
  categories: [String],     // e.g., ["Fast Food", "Burgers", "Wraps"]
  description: String,
  menuStatus: String,       // 'available' | 'unavailable'
  active: Boolean,
  isCounterBased: Boolean,  // true for One Food World
  sharedMenuId: String,     // 'nescafe_shared_menu' for the 5 Nescafe spots
  mustTryItem: String,      // e.g., "NC Special Chai"
  recommendedBy: String,    // 'Our pick' | 'Friend's pick' | 'Student community'
  openingHours: String
}
```

### 2.3 `Counter` (`models/Counter.js`)
Represents individual culinary counters within unified food courts (specifically One Food World).
```javascript
{
  _id: ObjectId,
  foodSpot: ObjectId,       // References FoodSpot (One Food World)
  foodSpotSlug: String,     // "one-food-world"
  name: String,             // "Al Beirut", "Korean Wok Box", etc.
  slug: String,             // "al-beirut"
  cuisine: String,          // e.g., "Lebanese Rolls, Shawarma, Grilled BBQ"
  description: String
}
```

### 2.4 `MenuItem` (`models/MenuItem.js`)
Stores granular dish records parsed from CSV and XLSX datasets.
```javascript
{
  _id: ObjectId,
  name: String,             // e.g., "Veg Cream Cheese Pasta"
  normalizedName: String,   // Lowercase for regex text search
  foodSpot: ObjectId,       // References FoodSpot
  foodSpotSlug: String,
  counter: String,          // e.g., "Al Beirut" (null for standalone spots)
  counterId: ObjectId,
  categories: [String],     // e.g., ["Pasta", "Fast Food"]
  description: String,
  price: Number,            // null if missing in dataset (never 0!)
  priceVariants: [{
    variant: String,        // "Regular", "Medium", "Large" or "Half", "Full"
    price: Number
  }],
  foodClassification: String, // 'veg' | 'non-veg' | 'vegan' | 'unclassified'
  classificationSource: String, // 'explicit' | 'inferred' | 'unknown'
  isMustTry: Boolean,
  recommendedBy: String,
  sourceFile: String,       // e.g., "srisabari.csv"
  importedAt: Date
}
```

### 2.5 `Recommendation` (`models/Recommendation.js`)
Stores student recommendations subjected to moderation.
```javascript
{
  _id: ObjectId,
  foodSpot: ObjectId,
  foodSpotName: String,
  menuItem: ObjectId,
  dishName: String,
  category: String,         // 'Must Try' | 'Best Meal' | 'Best Snack' | 'Best Beverage' | etc.
  text: String,
  displayName: String,
  anonymous: Boolean,
  status: String,           // 'pending' | 'approved' | 'rejected'
  createdAt: Date
}
```

### 2.6 `Admin` (`models/Admin.js`)
Stores administrator accounts with salted bcrypt hashes.
```javascript
{
  _id: ObjectId,
  username: String,         // "admin"
  passwordHash: String,     // Salted bcrypt hash
  role: String,             // "admin"
  createdAt: Date
}
```

---

## 3. Database Indexes (Section 50 Requirement)
To ensure optimal performance and scalability, the following compound and text indexes are created:
1. `MenuItem.index({ normalizedName: 'text', description: 'text' })` — Full-text dish search.
2. `MenuItem.index({ foodSpot: 1, price: 1 })` — Budget-constrained menu retrieval.
3. `MenuItem.index({ foodSpot: 1, categories: 1 })` — Category filtering within outlets.
4. `Counter.index({ foodSpot: 1, name: 1 }, { unique: true })` — Counter uniqueness per court.
5. `FoodSpot.index({ slug: 1 }, { unique: true })` — Rapid slug resolution.
6. `CampusLocation.index({ slug: 1 }, { unique: true })` — Location relationship mapping.
