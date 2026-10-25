const http = require('http');
const { connectDB } = require('../server/config/db');
const app = require('../server/app');
const dataStore = require('../server/services/dataStore');
const { processUserChat } = require('../server/services/aiService');

let server;
let serverPort;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: serverPort,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('  VIT FOOD SPOT GUIDE — COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('===============================================================');

  await connectDB();

  server = app.listen(0);
  serverPort = server.address().port;
  console.log(`[Test Server] Running on ephemeral port ${serverPort}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 1: FLORA MENU ITEM NAMING ("NOODLES" -> "RICE")
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Flora Menu Correction ---');
  const floraSpot = await dataStore.getFoodSpotByIdOrSlug('flora');
  assert(floraSpot && floraSpot.name === 'Flora', 'Flora food spot exists in database');
  assert(floraSpot.categories.includes('Rice'), "Flora spot categories include 'Rice'");

  const floraItemsRes = await dataStore.getMenuItems({ foodSpot: 'flora', limit: 500 });
  const floraItems = floraItemsRes.items;
  assert(floraItems.length >= 200, `Flora has ${floraItems.length} menu items`);

  const riceNamedUnderNoodles = floraItems.filter(i => 
    i.category === 'Noodles' && (i.name.toLowerCase().includes('rice') || i.name.toLowerCase().includes('biriyani'))
  );
  assert(riceNamedUnderNoodles.length === 0, `0 rice items categorized under 'Noodles' (found: ${riceNamedUnderNoodles.length})`);

  const riceItems = floraItems.filter(i => i.category === 'Rice');
  assert(riceItems.length >= 30, `Flora has ${riceItems.length} items properly categorized as 'Rice'`);

  const vegFriedRice = floraItems.find(i => i.name === 'Veg Fried Rice');
  assert(vegFriedRice && vegFriedRice.category === 'Rice', "Veg Fried Rice is categorized under 'Rice'");

  const chickenFriedRice = floraItems.find(i => i.name === 'Chicken Fried Rice');
  assert(chickenFriedRice && chickenFriedRice.category === 'Rice', "Chicken Fried Rice is categorized under 'Rice'");

  const vegHakkaNoodles = floraItems.find(i => i.name === 'Veg Hakka Noodles');
  assert(vegHakkaNoodles && vegHakkaNoodles.category === 'Noodles', "Veg Hakka Noodles is categorized under 'Noodles'");

  // -------------------------------------------------------------------------
  // TEST GROUP 2: FAVORITES SYSTEM (MARKING, LISTING, REMOVING)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Favorites System ---');
  const addFavSpotRes = await request({ path: '/api/favorites', method: 'POST' }, JSON.stringify({
    userId: 'guest_student',
    foodSpotId: 'flora'
  }));
  assert(addFavSpotRes.status === 201 && addFavSpotRes.body.success, 'Successfully favorited Flora spot');

  const addFavDishRes = await request({ path: '/api/favorites', method: 'POST' }, JSON.stringify({
    userId: 'guest_student',
    foodSpotId: 'flora',
    menuItemId: 'flora_87_veg_fried_rice'
  }));
  assert(addFavDishRes.status === 201 && addFavDishRes.body.success, 'Successfully favorited Veg Fried Rice dish');

  const listFavRes = await request({ path: '/api/favorites?userId=guest_student' });
  assert(listFavRes.status === 200 && listFavRes.body.total >= 2, `Retrieved ${listFavRes.body.total} saved favorites for guest`);

  const removeDishRes = await request({ path: '/api/favorites/flora_87_veg_fried_rice?userId=guest_student', method: 'DELETE' });
  assert(removeDishRes.status === 200 && removeDishRes.body.success, 'Successfully removed dish favorite');

  const removeSpotRes = await request({ path: '/api/favorites/flora?userId=guest_student', method: 'DELETE' });
  assert(removeSpotRes.status === 200 && removeSpotRes.body.success, 'Successfully removed food spot favorite');

  const postRemoveFavRes = await request({ path: '/api/favorites?userId=guest_student' });
  assert(postRemoveFavRes.body.total === 0, 'Favorites correctly emptied after removal');

  // -------------------------------------------------------------------------
  // TEST GROUP 3: EXPLORE PAGE, SEARCH, & FILTERS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Explore Page, Search & Filters ---');
  const allSpotsRes = await request({ path: '/api/food-spots' });
  assert(allSpotsRes.status === 200 && allSpotsRes.body.count === 31, 'All 31 verified food spots returned');

  const biryaniSearchRes = await request({ path: '/api/menu-items/search?q=biryani' });
  assert(biryaniSearchRes.status === 200 && biryaniSearchRes.body.data.length > 0, `Search for 'biryani' returned ${biryaniSearchRes.body.data.length} dishes`);
  assert(biryaniSearchRes.body.spots.length > 0, `Search for 'biryani' returned ${biryaniSearchRes.body.spots.length} matching spots`);

  const floraDetailRes = await request({ path: '/api/food-spots/flora' });
  assert(floraDetailRes.status === 200 && floraDetailRes.body.data.name === 'Flora', 'GET /api/food-spots/flora returns spot details');
  assert(floraDetailRes.body.data.menuItems.length >= 200, `Flora detail includes ${floraDetailRes.body.data.menuItems.length} menu items`);

  // -------------------------------------------------------------------------
  // TEST GROUP 4: AI CHATBOT INTELLIGENCE & ACCURACY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: AI Chatbot Logic & Grounding ---');
  const testChatQueries = [
    { q: 'Where can I get biriyani from these places?', expectWord: 'biryani' },
    { q: 'What food is near SJT?', expectWord: 'Arasan' },
    { q: 'What is near PRP?', expectWord: 'Pearl Research Park' },
    { q: 'Where can I get coffee?', expectWord: 'coffee' },
    { q: 'What can I get under 100?', expectWord: '₹' },
    { q: 'Tell me about One Food World', expectWord: 'Al Beirut' },
    { q: 'Tell me about Flora', expectWord: 'Flora' },
    { q: 'hi', expectWord: 'Hello' }
  ];

  const BAD_REPETITIVE_STRING = "Food spots near PRP include: Olives Cafe, Sri Sabari (near PRP G08), Sri Sai Sabari. You can view complete menus and student picks for each spot on the Explore page.";

  for (const t of testChatQueries) {
    const res = await processUserChat(t.q);
    const hasBadString = res.reply.includes(BAD_REPETITIVE_STRING);
    assert(!hasBadString, `Query "${t.q}" does NOT return repetitive PRP fallback`);
    assert(res.reply.toLowerCase().includes(t.expectWord.toLowerCase()), `Query "${t.q}" response contains expected keyword '${t.expectWord}'`);
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 5: FEEDBACK SYSTEM & REVIEW RENDERING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Student Feedback Submission & Retrieval ---');
  const submitFbRes = await request({ path: '/api/feedback', method: 'POST' }, JSON.stringify({
    foodSpotId: 'flora',
    menuItemName: 'Veg Fried Rice',
    rating: 5,
    feedbackText: 'The Veg Fried Rice was freshly made and flavorful!',
    authorName: 'Aarav V, CSE 2025'
  }));
  assert(submitFbRes.status === 201 && submitFbRes.body.success, 'Successfully submitted new student feedback');

  const getFbRes = await request({ path: '/api/feedback' });
  assert(getFbRes.status === 200 && getFbRes.body.total >= 1, `Retrieved ${getFbRes.body.total} reviews`);
  const latestFb = getFbRes.body.feedback[0];
  assert(latestFb.foodSpotName === 'Flora', `Review has correct foodSpotName 'Flora' (got: ${latestFb.foodSpotName})`);
  assert(latestFb.feedbackText.includes('freshly made'), 'Review content preserved');
  assert(latestFb.userName === 'Aarav V, CSE 2025', 'Review author preserved');

  console.log('\n===============================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  if (server) server.close();
  process.exit(1);
});
