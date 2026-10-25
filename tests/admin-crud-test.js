/**
 * Admin Dashboard & CRUD Operations Test Suite
 * Verifies admin authentication (session & token header),
 * food spot (restaurant) CRUD, and menu item CRUD.
 */

const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b || '{}'), headers: res.headers }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b || '{}'), headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

function put(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b || '{}'), headers: res.headers }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function del(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'DELETE',
      headers
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b || '{}'), headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('===============================================================');
  console.log('  ADMIN DASHBOARD & CRUD OPERATIONS VERIFICATION');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(msg, cond) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Unauthenticated request rejection
    const unauth = await get('/api/admin/data-quality');
    assert('Unauthenticated request to /api/admin/data-quality returns 401', unauth.status === 401);

    // 2. Admin Login
    const login = await post('/api/admin/login', { username: 'admin', password: 'vitfoodguide2026' });
    assert('Admin login succeeds with 200', login.status === 200);
    assert('Admin login returns authentication token', !!login.data?.token);

    const token = login.data?.token;
    const authHeaders = { 'x-admin-token': token };

    // 3. Metrics Access
    const metrics = await get('/api/admin/data-quality', authHeaders);
    assert('Authenticated metrics access succeeds with 200', metrics.status === 200);
    assert('Metrics return valid food spots count >= 31', metrics.data?.data?.totalFoodSpots >= 31);
    assert('Metrics return valid menu items count > 3300', metrics.data?.data?.totalMenuItems > 3300);

    // 4. Session Verification
    const session = await get('/api/admin/session', authHeaders);
    assert('Admin session endpoint reports authenticated: true', session.status === 200 && session.data?.authenticated === true);

    // 5. Restaurant (Food Spot) Creation
    const spotSlug = 'automated-test-cafe';
    const newSpot = await post('/api/admin/food-spots', {
      name: 'Automated Test Cafe',
      slug: spotSlug,
      locationId: 'prp',
      zone: 'Academic Blocks',
      specificLocation: 'Pearl Research Park Ground Floor',
      categories: ['Chai', 'Fast Food'],
      description: 'Test cafe for automated verification',
      mustTryItem: 'Test Ginger Tea'
    }, authHeaders);
    assert('Admin can create new restaurant (201)', newSpot.status === 201 && newSpot.data?.data?.name === 'Automated Test Cafe');

    // 6. Restaurant Update
    const updateSpot = await put(`/api/admin/food-spots/${spotSlug}`, {
      name: 'Automated Test Cafe Deluxe',
      description: 'Upgraded description'
    }, authHeaders);
    assert('Admin can update restaurant details (200)', updateSpot.status === 200 && updateSpot.data?.data?.name === 'Automated Test Cafe Deluxe');

    // 7. Menu Item Creation
    const newDish = await post('/api/admin/menu-items', {
      foodSpotId: spotSlug,
      name: 'Automated Crispy Samosa',
      category: 'Fast Food',
      price: 25,
      dietary: 'veg',
      isMustTry: true
    }, authHeaders);
    assert('Admin can add menu item to restaurant (201)', newDish.status === 201 && newDish.data?.data?.name === 'Automated Crispy Samosa');
    const dishId = newDish.data?.data?.id;

    // 8. Menu Item Update
    const updateDish = await put(`/api/admin/menu-items/${dishId}`, {
      name: 'Automated Crispy Samosa (2 Pcs)',
      price: 30
    }, authHeaders);
    assert('Admin can update dish price & name (200)', updateDish.status === 200 && updateDish.data?.data?.price === 30);

    // 9. Menu Item Deletion
    const deleteDish = await del(`/api/admin/menu-items/${dishId}`, authHeaders);
    assert('Admin can delete menu item (200)', deleteDish.status === 200);

    // 10. Restaurant Deletion
    const deleteSpot = await del(`/api/admin/food-spots/${spotSlug}`, authHeaders);
    assert('Admin can delete restaurant (200)', deleteSpot.status === 200);

    // 11. Admin Logout
    const logout = await post('/api/admin/logout', {}, authHeaders);
    assert('Admin logout succeeds (200)', logout.status === 200);

    console.log('===============================================================');
    console.log(`  ADMIN RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

run();
