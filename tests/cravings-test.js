const assert = require('assert');

async function runCravingsTest() {
  console.log('===============================================================');
  console.log('  CRAVINGS & DISH SELECTION VERIFICATION TEST');
  console.log('===============================================================');

  const BASE_URL = 'http://localhost:5000';

  // 1. Juices & Shakes Craving Search
  const juiceRes = await fetch(`${BASE_URL}/api/menu-items/search?q=${encodeURIComponent('juice shake smoothie lassi')}`);
  assert.strictEqual(juiceRes.status, 200, 'Juice search should return HTTP 200');
  const juiceData = await juiceRes.json();
  assert.strictEqual(juiceData.success, true, 'Juice search should succeed');
  assert.ok(juiceData.total >= 50, `Should return abundant juices & shakes (found: ${juiceData.total})`);
  assert.ok(juiceData.spots.length >= 5, `Should return multiple juice outlets (found: ${juiceData.spots.length})`);

  // Verify dish metadata enrichment: restaurant name & campus location
  const sampleJuice = juiceData.data.find(d => d.foodSpotName && d.spotLocation);
  assert.ok(sampleJuice, 'Dishes must have enriched foodSpotName and spotLocation');
  assert.ok(sampleJuice.price !== undefined, 'Dish must include price');
  console.log(`[PASS] Juices & Shakes craving returned ${juiceData.total} dishes across ${juiceData.spots.length} outlets.`);
  console.log(`       Sample: "${sampleJuice.name}" (₹${sampleJuice.price}) at ${sampleJuice.foodSpotName} (${sampleJuice.spotLocation})`);

  // 2. Chai & Tea Craving Search
  const chaiRes = await fetch(`${BASE_URL}/api/menu-items/search?q=${encodeURIComponent('chai tea coffee brew')}`);
  const chaiData = await chaiRes.json();
  assert.ok(chaiData.total >= 20, 'Chai search should return dishes');
  assert.ok(chaiData.spots.length >= 5, 'Chai search should return outlets');
  console.log(`[PASS] Chai & Tea craving returned ${chaiData.total} items across ${chaiData.spots.length} outlets.`);

  // 3. Rolls & Snacks Craving Search
  const rollsRes = await fetch(`${BASE_URL}/api/menu-items/search?q=${encodeURIComponent('roll snack burger wrap sandwich frankie')}`);
  const rollsData = await rollsRes.json();
  assert.ok(rollsData.total >= 50, 'Rolls & Snacks search should return dishes');
  console.log(`[PASS] Rolls & Snacks craving returned ${rollsData.total} items across ${rollsData.spots.length} outlets.`);

  // 4. Meals & Biryani Craving Search
  const mealsRes = await fetch(`${BASE_URL}/api/menu-items/search?q=${encodeURIComponent('biryani meal thali rice combo')}`);
  const mealsData = await mealsRes.json();
  assert.ok(mealsData.total >= 30, 'Meals search should return dishes');
  console.log(`[PASS] Meals & Biryanis craving returned ${mealsData.total} items across ${mealsData.spots.length} outlets.`);

  // 5. South Indian Craving Search
  const southRes = await fetch(`${BASE_URL}/api/menu-items/search?q=${encodeURIComponent('dosa idli vada pongal uthappam')}`);
  const southData = await southRes.json();
  assert.ok(southData.total >= 20, 'South Indian search should return dishes');
  console.log(`[PASS] South Indian craving returned ${southData.total} items across ${southData.spots.length} outlets.`);

  // 6. Bakery & Desserts Craving Search
  const dessertRes = await fetch(`${BASE_URL}/api/menu-items/search?q=${encodeURIComponent('ice cream waffle cake pastry dessert brownie sundae')}`);
  const dessertData = await dessertRes.json();
  assert.ok(dessertData.total >= 50, 'Dessert search should return dishes');
  console.log(`[PASS] Bakery & Desserts craving returned ${dessertData.total} items across ${dessertData.spots.length} outlets.`);

  console.log('===============================================================');
  console.log('  ALL CRAVING TESTS PASSED (6/6)');
  console.log('===============================================================');
}

runCravingsTest().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
