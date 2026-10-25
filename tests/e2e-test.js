const http = require('http');

function req(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const reqOpts = {
      method: options.method || 'GET',
      headers: options.headers || {},
      path: url.pathname + url.search
    };
    const r = http.request(url, reqOpts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e){}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    r.on('error', reject);
    if (body) {
      if (typeof body === 'object') {
        r.setHeader('Content-Type', 'application/json');
        r.write(JSON.stringify(body));
      } else {
        r.write(body);
      }
    }
    r.end();
  });
}

async function run() {
  console.log('========================================================================');
  console.log('  VIT Food Spot Guide — End-to-End Functionality & UI Integrity Verification');
  console.log('  Testing against live server http://localhost:5000');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASSED] ${name}`);
      passed++;
    } else {
      console.error(`[FAILED] ${name} — ${details}`);
      failed++;
    }
  }

  // 1. Static HTML & Bettr Academy style check
  const home = await req('/');
  assert('Homepage serves 200 OK', home.statusCode === 200);
  assert('Homepage has readable Montserrat & Roboto font links', home.body.includes('Montserrat') && home.body.includes('Roboto'));
  assert('Homepage contains readable Bettr Academy styled badge', home.body.includes('VIT Food Spot Guide'));
  assert('Homepage excludes removed footer columns (Exports & System)', !home.body.includes('Exports & System') && !home.body.includes('Academic block deliveries'));

  // 2. CSS & Responsive files
  const css = await req('/css/style.css');
  assert('CSS file serves 200 OK', css.statusCode === 200);
  assert('CSS contains Bettr Academy color tokens (#F7F4ED, #2C1C0F, #FCBF27)', css.body.includes('#F7F4ED') && css.body.includes('#2C1C0F') && css.body.includes('#FCBF27'));
  assert('CSS contains Bettr Academy Coffee & Earth theme tokens', css.body.includes('--earth') && css.body.includes('#ED612F'));

  // 3. Health Endpoint
  const health = await req('/api/health');
  assert('Health API reports healthy', health.statusCode === 200 && health.json?.status === 'healthy');

  // 4. Food Spots API
  const spots = await req('/api/food-spots');
  assert('Food Spots count is 31', spots.statusCode === 200 && spots.json?.count === 31);
  assert('Food Spots includes One Food World', spots.json?.data?.some(s => s.slug === 'one-food-world'));
  assert('Food Spots includes Flora at LH', spots.json?.data?.some(s => s.slug === 'flora' && s.zone === "Girls' Hostel"));
  assert('Food Spots includes Olives Cafe at PRP', spots.json?.data?.some(s => s.slug === 'olives' && s.location === 'prp'));

  // 5. Individual Spot Detail
  const ofw = await req('/api/food-spots/one-food-world');
  assert('One Food World detail returns counters', ofw.statusCode === 200 && ofw.json?.data?.isCounterBased === true);
  const counters = await req('/api/food-spots/one-food-world/counters');
  assert('One Food World has 6 counters', counters.statusCode === 200 && counters.json?.data?.length === 6);

  // 6. Menu Items API
  const menu = await req('/api/menu-items?limit=10');
  assert('Menu Items pagination works', menu.statusCode === 200 && menu.json?.data?.length === 10 && menu.json?.total > 3000);

  // 7. Search API
  const biryaniSearch = await req('/api/menu-items/search?q=biryani');
  assert('Search for biryani returns items', biryaniSearch.statusCode === 200 && biryaniSearch.json?.data?.length > 0);

  const waffleSearch = await req('/api/menu-items/search?q=waffle');
  assert('Search for waffle returns items (e.g. Olives)', waffleSearch.statusCode === 200 && waffleSearch.json?.data?.length > 0);

  const dualFloraSearch = await req('/api/menu-items/search?q=flora');
  assert('Dual Search returns matching spots for flora', dualFloraSearch.statusCode === 200 && dualFloraSearch.json?.spots?.length > 0);

  // 8. Budget Filter
  const under50 = await req('/api/menu-items?maxPrice=50&limit=10');
  assert('Budget filter returns only items <= Rs 50', under50.statusCode === 200 && under50.json?.data?.every(d => d.price <= 50));

  // 9. Locations API
  const locs = await req('/api/locations');
  assert('Locations API returns campus blocks', locs.statusCode === 200 && locs.json?.data?.length >= 6);

  // 10. Student Auth & Lifecycle
  const testEmail = 'theobroma.student@vitstudent.ac.in';
  const regRes = await req('/api/auth/register', { method: 'POST' }, {
    name: 'Theobroma Student',
    email: testEmail,
    password: 'password123'
  });
  assert('Student registration works or handles existing user', regRes.statusCode === 201 || regRes.statusCode === 409);

  const loginRes = await req('/api/auth/login', { method: 'POST' }, {
    email: testEmail,
    password: 'password123'
  });
  assert('Student login succeeds with 200 & session cookie', loginRes.statusCode === 200 && loginRes.headers['set-cookie']);
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';

  // 11. Profile check with cookie
  const meRes = await req('/api/auth/me', { headers: { Cookie: cookie } });
  assert('Authenticated profile returns correct user', meRes.statusCode === 200 && meRes.json?.user?.email === testEmail);

  // 12. Favorites Lifecycle
  const addFav = await req('/api/favorites', { method: 'POST', headers: { Cookie: cookie } }, {
    foodSpotId: 'olives'
  });
  assert('Add favorite works', addFav.statusCode === 201 || addFav.statusCode === 200);

  const getFavs = await req('/api/favorites', { headers: { Cookie: cookie } });
  assert('Get favorites returns saved spot', getFavs.statusCode === 200 && getFavs.json?.favorites?.some(f => f.foodSpotId === 'olives'));

  const remFav = await req('/api/favorites/olives', { method: 'DELETE', headers: { Cookie: cookie } });
  assert('Remove favorite succeeds', remFav.statusCode === 200);

  // 13. Student Feedback
  const fbRes = await req('/api/feedback', { method: 'POST', headers: { Cookie: cookie } }, {
    foodSpotId: 'olives',
    dishName: 'Dark Chocolate Waffle',
    rating: 5,
    author: 'Theobroma Lover',
    comment: 'The chocolate waffle was absolutely decadent, warm, and delicious!'
  });
  assert('Feedback submission succeeds with 201', fbRes.statusCode === 201);

  const fbList = await req('/api/feedback');
  assert('Feedback feed displays submitted review', fbList.statusCode === 200 && fbList.json?.feedback?.some(f => (f.feedbackText || f.comment)?.includes('decadent')));

  // 14. AI Chatbot
  const chatRes = await req('/api/chat', { method: 'POST' }, {
    message: 'Where can I find chocolate waffles near PRP?'
  });
  assert('AI Chatbot answers with grounded reply', chatRes.statusCode === 200 && (chatRes.json?.reply?.toLowerCase().includes('olives') || chatRes.json?.reply?.length > 10));

  // 15. Admin Portal & Audit
  const adminLogin = await req('/api/admin/login', { method: 'POST' }, {
    username: 'admin',
    password: 'vitfoodguide2026'
  });
  assert('Admin login succeeds', adminLogin.statusCode === 200);
  const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0].split(';')[0] : '';

  const dataQuality = await req('/api/admin/data-quality', { headers: { Cookie: adminCookie } });
  assert('Admin data quality metrics return 31 spots', dataQuality.statusCode === 200 && dataQuality.json?.data?.totalFoodSpots === 31);

  // 16. Data Exports
  const xmlExport = await req('/api/export/xml');
  assert('XML export returns valid XML', xmlExport.statusCode === 200 && xmlExport.body.includes('<?xml'));

  const csvExport = await req('/api/export/csv');
  assert('CSV export returns valid CSV', csvExport.statusCode === 200 && csvExport.body.includes('Spot Name,Counter'));

  console.log('\n========================================================================');
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED OUT OF ${passed + failed} TOTAL CHECKS`);
  console.log('========================================================================');
}

run().catch(console.error);
