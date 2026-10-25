const fs = require('fs');
const path = require('path');
const dataStore = require('../server/services/dataStore');

console.log('[Script] Generating live data quality audit report...');

const spots = dataStore.foodSpots;
const items = dataStore.menuItems;
const locations = dataStore.campusLocations;
const counters = dataStore.counters;

const missingPrices = items.filter(i => i.price === null).length;
const variants = items.filter(i => i.priceVariants && i.priceVariants.length > 0).length;
const vegCount = items.filter(i => i.foodClassification === 'veg').length;
const nonVegCount = items.filter(i => i.foodClassification === 'non-veg').length;
const unclassifiedCount = items.filter(i => i.foodClassification === 'unclassified').length;
const availableSpots = spots.filter(s => s.menuStatus === 'available').length;
const unavailableSpots = spots.filter(s => s.menuStatus === 'unavailable').length;

const report = `# Live Data Quality Audit Report

Generated at: **${new Date().toISOString()}**

## Metric Summary
- **Verified Campus Food Spots**: ${spots.length}
- **Spots with Menus Available**: ${availableSpots}
- **Spots Awaiting Menu Upload**: ${unavailableSpots}
- **One Food World Counters**: ${counters.length}
- **Campus Locations**: ${locations.length}
- **Total Menu Dishes**: ${items.length}
- **Dishes with Missing Prices**: ${missingPrices} (labeled 'Price not listed', never treated as 0)
- **Dishes with Price Variants**: ${variants}
- **Vegetarian Dishes**: ${vegCount}
- **Non-Vegetarian Dishes**: ${nonVegCount}
- **Unclassified Dishes**: ${unclassifiedCount}
`;

fs.writeFileSync(path.resolve('docs/data-quality-report.md'), report, 'utf8');
console.log('Report updated at docs/data-quality-report.md');
