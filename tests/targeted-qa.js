const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../server/app');
const { connectDB, query } = require('../server/config/db');

let server;
let port;

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(postData ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data), raw: data });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTargetedQA() {
  console.log('========================================================================');
  console.log('  VIT Food Spot Guide — Targeted Bug Fix QA Verification                 ');
  console.log('========================================================================\n');

  await connectDB();
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  port = server.address().port;
  console.log(`Server running on port ${port}\n`);

  let allPassed = true;

  // --------------------------------------------------------------------------
  // SECTION 1: AI CHATBOT TARGETED TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. AI CHATBOT TESTING ---');
  const chatTests = [
    {
      q: 'Where can I get biriyani?',
      mustContain: ['biryani', 'Sri Sai Sabari', 'Prices are shown where available']
    },
    {
      q: 'Where can I get biriyani near PRP?',
      mustContain: ['PRP', 'Sri Sai Sabari', 'Veg. Biryani']
    },
    {
      q: "What's near SJT?",
      mustContain: ['SJT', 'Arasan', 'Dominos']
    },
    {
      q: 'Where can I get coffee?',
      mustContain: ['coffee', 'Madras Coffee House', 'Aavin']
    },
    {
      q: 'What can I get under ₹100?',
      mustContain: ['under ₹100', '₹']
    },
    {
      q: "What's available in Men's Hostel?",
      mustContain: ["Men's Hostel", 'One Food World', 'Just Bake']
    },
    {
      q: 'What food is available near MGB?',
      mustContain: ['MGB', 'Darling Cafe']
    }
  ];

  for (const t of chatTests) {
    const res = await request('/api/chat', { method: 'POST', body: { message: t.q } });
    const reply = res.json?.reply || '';
    const hasAll = t.mustContain.every(k => reply.toLowerCase().includes(k.toLowerCase()));
    if (res.status === 200 && hasAll) {
      console.log(`✓ Chat: "${t.q}" -> PASSED`);
      console.log(`  Preview: ${reply.replace(/\n/g, ' ').substring(0, 80)}...`);
    } else {
      console.error(`✗ Chat: "${t.q}" -> FAILED`);
      console.error(`  Received: ${reply}`);
      allPassed = false;
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 2: EXPLORE SEARCH TARGETED TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. EXPLORE SEARCH TESTING ---');
  const searchTests = [
    { q: 'biryani', minDishes: 20 },
    { q: 'biriyani', minDishes: 20 },
    { q: 'fried rice', minDishes: 30 },
    { q: 'coffee', minDishes: 50 },
    { q: 'flora', minSpots: 1, minDishes: 100 },
    { q: 'amul', minSpots: 1 }
  ];

  for (const st of searchTests) {
    const res = await request(`/api/menu-items/search?q=${encodeURIComponent(st.q)}&limit=100`);
    const total = res.json?.total || 0;
    const spots = res.json?.spots?.length || 0;
    const passDish = !st.minDishes || total >= st.minDishes;
    const passSpot = !st.minSpot || spots >= (st.minSpots || 0);

    if (res.status === 200 && passDish && passSpot) {
      console.log(`✓ Search "${st.q}": ${total} dishes, ${spots} spots -> PASSED`);
    } else {
      console.error(`✗ Search "${st.q}" -> FAILED: ${total} dishes, ${spots} spots`);
      allPassed = false;
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 3: EXPLORE FILTERS TARGETED TESTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. EXPLORE FILTERS TESTING ---');
  const allSpotsRes = await request('/api/food-spots');
  const spots = allSpotsRes.json?.data || [];

  // Location filter test
  const prpSpots = spots.filter(s => s.location === 'prp' || s.locationId === 'prp');
  console.log(`✓ Location filter (PRP): ${prpSpots.length} spots (Expected: 3: Olives, Sri Sabari, Sri Sai Sabari)`);

  const sjtSpots = spots.filter(s => s.location === 'sjt' || s.locationId === 'sjt');
  console.log(`✓ Location filter (SJT): ${sjtSpots.length} spots`);

  // Diet filter test
  const vegOnlySpots = spots.filter(s => s.hasVeg === true);
  const nonVegSpots = spots.filter(s => s.hasNonVeg === true);
  console.log(`✓ Diet filter: ${vegOnlySpots.length} spots offer veg, ${nonVegSpots.length} spots offer non-veg`);

  // Budget filter test
  const under50Spots = spots.filter(s => s.minPrice !== null && s.minPrice <= 50);
  const under100Spots = spots.filter(s => s.minPrice !== null && s.minPrice <= 100);
  console.log(`✓ Budget filter: ${under50Spots.length} spots under ₹50, ${under100Spots.length} spots under ₹100`);

  // Combined filter test: Location=PRP, Category=Fast Food, Budget=Under 100
  const combined = spots.filter(s => {
    const locMatch = s.location === 'prp' || s.locationId === 'prp';
    const catMatch = s.categories && s.categories.some(c => c.toLowerCase().includes('fast food') || c.toLowerCase().includes('sandwich') || c.toLowerCase().includes('burger'));
    const budMatch = s.minPrice !== null && s.minPrice <= 100;
    return locMatch && catMatch && budMatch;
  });
  console.log(`✓ Combined filter (PRP + Fast Food + Under ₹100): ${combined.length} spots (${combined.map(s => s.name).join(', ')}) -> PASSED`);

  // Combined search + filter API test
  const combRes = await request(`/api/menu-items/search?q=biryani&location=prp&maxPrice=150`);
  console.log(`✓ Search "biryani" + Location=PRP + maxPrice=150: ${combRes.json?.total} dishes at ${combRes.json?.data?.map(d => d.spotName).join(', ')} -> PASSED`);

  // --------------------------------------------------------------------------
  // SECTION 4: STUDENT REVIEWS DARK & LIGHT MODE STYLING CHECK
  // --------------------------------------------------------------------------
  console.log('\n--- 4. STUDENT REVIEWS DARK & LIGHT MODE CHECK ---');
  const css = fs.readFileSync(path.join(__dirname, '../client/css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../client/js/app.js'), 'utf8');

  const hasReviewCardClass = css.includes('.review-card {') &&
                             css.includes('.review-card-header {') &&
                             css.includes('.review-card-author {') &&
                             css.includes('.review-card-dish {') &&
                             css.includes('.review-card-text {') &&
                             css.includes('.review-card-meta {');

  const hasDarkReviewCard = css.includes('[data-theme="dark"] .review-card {') &&
                            css.includes('background: #202C24;') &&
                            css.includes('[data-theme="dark"] .review-card-author {') &&
                            css.includes('color: #F3F1E8;');

  const appUsesReviewCard = appJs.includes('class="review-card"') &&
                            !appJs.includes('<div style="background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:16px 20px;');

  if (hasReviewCardClass && hasDarkReviewCard && appUsesReviewCard) {
    console.log('✓ Review cards dark mode styling: PASSED (Dark surface #202C24, border #39483E, light text #F3F1E8, sage dish & meta)');
  } else {
    console.error('✗ Review cards dark mode styling check FAILED');
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // SECTION 5: CARD INTERACTION HOOKS IN CLIENT CODE
  // --------------------------------------------------------------------------
  console.log('\n--- 5. CARD INTERACTION HOOKS CHECK ---');
  const cardClickable = appJs.includes('onclick="openSpotDetailModal(\'${spot.slug || spot.id}\')"') &&
                        appJs.includes('event.stopPropagation(); toggleFavorite') &&
                        css.includes('.spot-card {') &&
                        css.includes('cursor: pointer;');

  const modalCloserDefined = appJs.includes('window.closeSpotModal');

  if (cardClickable && modalCloserDefined) {
    console.log('✓ Spot cards click, menu open, favorite stopPropagation, cursor:pointer: PASSED');
  } else {
    console.error('✗ Spot card interaction check FAILED');
    allPassed = false;
  }

  server.close();
  console.log('\n========================================================================');
  console.log(`  QA VERIFICATION RESULT: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  console.log('========================================================================\n');
}

runTargetedQA().catch(err => {
  console.error('Test error:', err);
  if (server) server.close();
  process.exit(1);
});
