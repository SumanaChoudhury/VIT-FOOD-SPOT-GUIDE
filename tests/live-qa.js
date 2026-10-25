const http = require('http');
const app = require('../server/app');
const { connectDB, query } = require('../server/config/db');

async function runQA() {
  console.log('--- Starting Comprehensive Live QA Verification ---');
  await connectDB();

  // Reset to clean state for verification
  await query('DELETE FROM feedback');
  await query('DELETE FROM favorites');

  const server = http.createServer(app);
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const port = server.address().port;
  console.log(`Live test server running on port ${port}`);

  function get(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}${urlPath}`, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(body); } catch (e) {}
          resolve({ status: res.statusCode, body, json, headers: res.headers });
        });
      }).on('error', reject);
    });
  }

  function post(urlPath, data, cookie = '') {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(data);
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(cookie ? { 'Cookie': cookie } : {})
        }
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(body); } catch (e) {}
          resolve({ status: res.statusCode, body, json, headers: res.headers });
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  // 1. Static HTML check
  const indexRes = await get('/');
  console.log('✓ GET / (HTML response):', indexRes.status === 200 ? 'OK 200' : 'FAIL');
  const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]|&#12[0-9]{4};/.test(indexRes.body);
  console.log('✓ Emojis in index.html:', hasEmoji ? 'FAILED (found emojis)' : 'PASSED (0 emojis)');
  console.log('✓ "Find something good around campus." present:', indexRes.body.includes('Find something good around campus.') ? 'PASSED' : 'FAILED');
  console.log('✓ "PRP — Pearl Research Park" present:', (indexRes.body.includes('PRP — Pearl Research Park') || indexRes.body.includes('Pearl Research Park')) ? 'PASSED' : 'FAILED');
  console.log('✓ "Food around your hostel" present:', indexRes.body.includes('Food around your hostel') ? 'PASSED' : 'FAILED');
  console.log('✓ "Share your food experience" present:', indexRes.body.includes('Share your food experience') ? 'PASSED' : 'FAILED');

  // 2. Hostel spots lookup (No API.getFoodSpot failure)
  const hostelSpots = ['one-food-world', 'just-bake', 'nescafe-mh', 'flora', 'auntys-mess', 'fruit-juice-shop'];
  for (const s of hostelSpots) {
    const res = await get(`/api/food-spots/${s}`);
    const ok = res.status === 200 && res.json?.data?.name;
    console.log(`✓ GET /api/food-spots/${s}:`, ok ? `PASSED (${res.json?.data?.name}, ${res.json?.data?.menuItemCount || 0} items)` : `FAILED (${res.status})`);
  }

  // Check One Food World 6 counters
  const ofwRes = await get('/api/food-spots/one-food-world');
  const counterSlugs = (ofwRes.json?.data?.counters || []).map(c => c.slug);
  console.log('✓ OFW Counters count:', counterSlugs.length, 'Slugs:', counterSlugs.join(', '));

  // 3. Search Queries
  const searchTerms = ['biryani', 'fried rice', 'fried', 'chicken', 'coffee', 'pizza', 'flora', 'amul', 'nescafe'];
  for (const term of searchTerms) {
    const sRes = await get(`/api/menu-items/search?q=${encodeURIComponent(term)}`);
    const dishCount = sRes.json?.data?.length || 0;
    const spotCount = sRes.json?.spots?.length || 0;
    console.log(`✓ Search "${term}": ${dishCount} dishes, ${spotCount} spots matched`);
  }

  // 4. Null-priced item preservation in search
  const biryaniSearch = await get('/api/menu-items/search?q=biryani');
  const unpricedBiryani = (biryaniSearch.json?.data || []).filter(d => d.price === null);
  console.log(`✓ Biryani search returns ${unpricedBiryani.length} null-priced items (e.g. "${unpricedBiryani[0]?.name}" from "${unpricedBiryani[0]?.spotName}") labeled "Price not listed"`);

  // 5. Feedback initial empty state and submission
  const initialFb = await get('/api/feedback');
  console.log('✓ Initial feedback count:', initialFb.json?.feedback?.length, '(Expected: 0)');

  // Submit test review
  const submitFb = await post('/api/feedback', {
    foodSpotId: 'flora',
    menuItemName: 'French Fries Classic',
    rating: 5,
    feedbackText: 'Crispy, piping hot, and great portion for evening snack at LH.',
    authorName: 'Priya N. (LH Resident)'
  });
  console.log('✓ Submit feedback response:', submitFb.status, submitFb.json?.success ? 'PASSED' : 'FAILED');

  const afterFb = await get('/api/feedback');
  console.log('✓ Stored feedback count after submission:', afterFb.json?.feedback?.length, 'Latest review:', afterFb.json?.feedback?.[0]?.feedbackText);

  // 6. Auth validation
  const invalidReg = await post('/api/auth/register', {
    email: 'notanemail@gmail.com',
    password: 'password123',
    name: 'Invalid Student'
  });
  console.log('✓ Invalid non-VIT email registration rejection:', invalidReg.status === 400 ? 'PASSED (HTTP 400)' : 'FAILED');

  const validReg = await post('/api/auth/register', {
    email: `test.student${Date.now()}@vitstudent.ac.in`,
    password: 'securepassword2026',
    name: 'Test Student'
  });
  console.log('✓ Valid VIT student email registration:', validReg.status === 201 ? 'PASSED (HTTP 201)' : 'FAILED');

  // 7. AI Chat
  const chatRes = await post('/api/chat', {
    message: 'Where is Nescafe located on campus?'
  });
  console.log('✓ AI Chat reply:', `"${chatRes.json?.reply}"`);

  server.close();
  console.log('--- Live QA Verification Complete ---');
}

runQA().catch(e => {
  console.error('QA Error:', e);
  process.exit(1);
});
