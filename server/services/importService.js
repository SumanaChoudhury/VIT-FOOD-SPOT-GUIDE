const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { appEvents } = require('../utils/eventEmitter');

// Dietary detection keywords
const NON_VEG_PATTERNS = [
  /\bchicken\b/i, /\begg\b/i, /\bnon[\s-]?veg\b/i, /\bfish\b/i, /\bmutton\b/i,
  /\bprawn\b/i, /\bmeat\b/i, /\bkeema\b/i, /\bbeef\b/i, /\blolly\s?pop\b/i,
  /\bwings\b/i, /\bomel[e]?tte\b/i, /\bboiled egg\b/i, /\bburji\b/i
];

const VEG_PATTERNS = [
  /\bveg\b/i, /\bpaneer\b/i, /\bmushroom\b/i, /\bcheese\b/i, /\bpotato\b/i,
  /\bcorn\b/i, /\baloo\b/i, /\bgobi\b/i, /\bdal\b/i, /\bcurd\b/i, /\bmilk\b/i,
  /\bchai\b/i, /\btea\b/i, /\blassi\b/i, /\bfruit\b/i, /\blime\b/i, /\blemon\b/i,
  /\bsoda\b/i, /\bjuice\b/i, /\bwaffle\b/i, /\bcake\b/i, /\bshake\b/i, /\bice cream\b/i
];

function cleanString(str) {
  if (!str) return '';
  return String(str)
    .replace(/\[cite:\s*\d+\]/gi, '') // Remove citation artifacts like [cite: 5]
    .replace(/[\r\n\t]+/g, ' ')
    .trim();
}

function parsePriceAndVariants(rawPrice) {
  if (rawPrice === null || rawPrice === undefined) {
    return { price: null, variants: [] };
  }

  const cleaned = cleanString(rawPrice);
  if (!cleaned || cleaned.toLowerCase() === 'null' || cleaned.toLowerCase() === 'n/a' || cleaned.includes('Price not clearly readable')) {
    return { price: null, variants: [] };
  }

  // Check for variant patterns like "40 / 70" or "40/70"
  if (cleaned.includes('/') && !cleaned.includes('http')) {
    const parts = cleaned.split('/').map(p => parseFloat(p.replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p));
    if (parts.length >= 2) {
      return {
        price: parts[0],
        variants: [
          { variant: 'Half / Small', price: parts[0] },
          { variant: 'Full / Large', price: parts[1] }
        ]
      };
    }
  }

  // Check for pipe variants like "1Kg: 550 | S: 300"
  if (cleaned.includes('|') || cleaned.includes(':')) {
    const subParts = cleaned.split(/[|;]/);
    const variants = [];
    subParts.forEach(sp => {
      const kv = sp.split(':');
      if (kv.length === 2) {
        const vName = cleanString(kv[0]);
        const vPrice = parseFloat(kv[1].replace(/[^0-9.]/g, ''));
        if (!isNaN(vPrice)) {
          variants.push({ variant: vName, price: vPrice });
        }
      }
    });
    if (variants.length > 0) {
      return {
        price: variants[0].price,
        variants
      };
    }
  }

  // Single numeric price
  const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
  if (!isNaN(num)) {
    return { price: num, variants: [] };
  }

  return { price: null, variants: [] };
}

function classifyFood(name, categoryName = '') {
  const text = `${name} ${categoryName}`.toLowerCase();

  // Explicit non-veg
  for (const pat of NON_VEG_PATTERNS) {
    if (pat.test(text)) {
      return {
        classification: 'non-veg',
        source: pat.test(categoryName) ? 'explicit' : 'inferred'
      };
    }
  }

  // Explicit or strong veg
  for (const pat of VEG_PATTERNS) {
    if (pat.test(text)) {
      return {
        classification: 'veg',
        source: pat.test(categoryName) ? 'explicit' : 'inferred'
      };
    }
  }

  return {
    classification: 'unclassified',
    source: 'unknown'
  };
}

function mapCategories(rawCategory, itemName = '') {
  const catSet = new Set();
  const c = (rawCategory || '').toLowerCase();
  const item = (itemName || '').toLowerCase();
  const combined = `${c} ${item}`;

  // Standard category detection
  if (/beverage|cooler|chiller|drink|mojito|soda|crush/.test(combined)) catSet.add('Beverages');
  if (/tea|chai/.test(combined)) {
    catSet.add('Beverages');
    catSet.add('Tea');
    catSet.add('Chai');
  }
  if (/coffee|cappuccino|latte|espresso/.test(combined)) {
    catSet.add('Beverages');
    catSet.add('Coffee');
  }
  if (/juice|shake|smoothie|falooda/.test(combined)) {
    catSet.add('Beverages');
    if (/juice/.test(combined)) catSet.add('Juices');
    if (/shake|smoothie/.test(combined)) catSet.add('Milkshakes');
  }
  if (/ice cream|sundae|kulfi/.test(combined)) {
    catSet.add('Ice Cream');
    catSet.add('Desserts');
  }
  if (/snack|starter|chaat|puri|vada|samosa|bhel|kachori|crispy|fries|nugget/.test(combined)) catSet.add('Snacks');
  if (/cake|pastry|tart|brownie|pie|mousse|sweet/.test(combined)) {
    catSet.add('Bakery');
    catSet.add('Cakes');
    catSet.add('Desserts');
  }
  if (/waffle/.test(combined)) {
    catSet.add('Bakery');
    catSet.add('Desserts');
  }
  if (/pizza/.test(combined)) {
    catSet.add('Pizza');
    catSet.add('Fast Food'); // Mandatory requirement: Pizza under Fast Food
  }
  if (/burger/.test(combined)) {
    catSet.add('Burgers');
    catSet.add('Fast Food'); // Mandatory requirement: Burgers under Fast Food
  }
  if (/wrap|roll|shawarma/.test(combined)) {
    catSet.add('Wraps');
    catSet.add('Rolls');
    catSet.add('Fast Food'); // Mandatory requirement: Wraps under Fast Food
  }
  if (/fried chicken|crispy chicken/.test(combined)) {
    catSet.add('Fried Chicken');
    catSet.add('Fast Food');
  }
  // Check specific item name first to distinguish noodles vs rice in combined headings like "Fried Rice / Noodles"
  if (/rice|biryani|biriyani|pulao|fried rice/.test(item)) {
    catSet.add('Rice');
    if (/biryani|biriyani/.test(item)) catSet.add('Biriyani');
  } else if (/noodle|chowmein|maggi/.test(item)) {
    catSet.add('Noodles');
    catSet.add('Chinese');
  }

  if (/noodle|chowmein|maggi/.test(combined) && !catSet.has('Rice')) {
    catSet.add('Noodles');
    catSet.add('Chinese');
  }
  if (/rice|biryani|biriyani|pulao|fried rice/.test(combined)) {
    catSet.add('Rice');
    if (/biryani|biriyani/.test(combined)) catSet.add('Biriyani');
  }
  if (/meals|thali|lunch|gravy|curry|roti|naan|parotta|chole bhature/.test(combined)) {
    catSet.add('Meals');
    if (/chole bhature/.test(combined)) catSet.add('Chole Bhature');
  }
  if (/dosa|idli|idly|vadai|pongal|sambar/.test(combined)) {
    catSet.add('South Indian');
    catSet.add('Meals');
  }
  if (/paneer butter masala|dal makhani|chana|tandoori/.test(combined)) {
    catSet.add('North Indian');
  }
  if (/chinese|manchurian|schezwan|wok/.test(combined)) {
    catSet.add('Chinese');
    catSet.add('Asian');
  }

  // Add the original cleaned category if meaningful
  if (rawCategory && rawCategory.trim().length > 0) {
    catSet.add(rawCategory.trim());
  }

  if (catSet.size === 0) {
    catSet.add('Other');
  }

  return Array.from(catSet);
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  function splitLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitLine(lines[0]).map(h => cleanString(h).toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = splitLine(line);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = parts[idx] !== undefined ? cleanString(parts[idx]) : '';
    });
    // Incomplete row check (e.g., "Cakes,Blue")
    if (parts.length === 1 && line.length < 3) continue;
    rows.push({ ...rowObj, _rawParts: parts });
  }

  return { headers, rows };
}

function parseXLSX(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (rawRows.length < 2) return { headers: [], rows: [] };

  const headers = rawRows[0].map(h => cleanString(h).toLowerCase());
  const rows = [];

  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!r || r.length === 0 || r.every(cell => cleanString(cell) === '')) continue;
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = r[idx] !== undefined ? cleanString(r[idx]) : '';
    });
    rows.push({ ...rowObj, _rawParts: r });
  }

  return { headers, rows };
}

module.exports = {
  cleanString,
  parsePriceAndVariants,
  classifyFood,
  mapCategories,
  parseCSV,
  parseXLSX
};
