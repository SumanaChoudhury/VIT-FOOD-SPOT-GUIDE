const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

async function runSuggestionsTestSuite() {
  console.log('===============================================================');
  console.log('  COMMUNITY SUGGESTIONS & ADMIN PRIVACY VERIFICATION SUITE');
  console.log('===============================================================');

  // Test 1: Public Submission of a Price Change Suggestion
  console.log('Test 1: Public submission of a price change suggestion');
  const sug1Payload = {
    foodSpotId: 'fruit-juice-shop',
    suggestionType: 'price_change',
    dishName: 'Badham Milk',
    currentPrice: 30,
    suggestedPrice: 35,
    category: 'Beverages',
    notes: 'Price changed yesterday at the counter to Rs 35.',
    userName: 'Test Student',
    userEmail: 'student.test2024@vitstudent.ac.in'
  };

  const submitRes1 = await fetch(`${BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sug1Payload)
  });

  assert.strictEqual(submitRes1.status, 201, 'Should return HTTP 201 Created on suggestion submission');
  const submitData1 = await submitRes1.json();
  assert.strictEqual(submitData1.success, true);
  assert.ok(submitData1.data.id, 'Should return created suggestion ID');
  const sug1Id = submitData1.data.id;
  console.log(`[PASS] Price change suggestion submitted: ID ${sug1Id} (${submitData1.message})`);

  // Test 2: Public Submission of a New Item Suggestion
  console.log('\nTest 2: Public submission of a new item suggestion');
  const sug2Payload = {
    foodSpotId: 'fruit-juice-shop',
    suggestionType: 'new_dish',
    dishName: 'Dragon Fruit Smoothie',
    suggestedPrice: 70,
    category: 'Beverages',
    notes: 'New seasonal smoothie counter launched at LH fruit juice shop.',
    userName: 'LH Student'
  };

  const submitRes2 = await fetch(`${BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sug2Payload)
  });

  assert.strictEqual(submitRes2.status, 201, 'Should return HTTP 201 Created');
  const submitData2 = await submitRes2.json();
  const sug2Id = submitData2.data.id;
  console.log(`[PASS] New dish suggestion submitted: ID ${sug2Id}`);

  // Test 3: Public endpoint DOES NOT expose suggestions to users (Privacy Guarantee)
  console.log('\nTest 3: Privacy check - Public users cannot view submitted suggestions');
  const publicGetRes = await fetch(`${BASE_URL}/api/suggestions`);
  assert.strictEqual(publicGetRes.status, 403, 'Public GET /api/suggestions must return 403 Forbidden');
  const publicGetData = await publicGetRes.json();
  assert.strictEqual(publicGetData.success, false);
  console.log(`[PASS] Public retrieval blocked: 403 Forbidden (${publicGetData.message})`);

  // Test 4: Unauthenticated admin access blocked
  console.log('\nTest 4: Unauthenticated request to /api/admin/suggestions is blocked');
  const unauthRes = await fetch(`${BASE_URL}/api/admin/suggestions`);
  assert.strictEqual(unauthRes.status, 401, 'Unauthenticated admin suggestions must return 401');
  console.log('[PASS] Unauthenticated access to admin suggestions rejected with 401');

  // Test 5: Admin Login
  console.log('\nTest 5: Administrator authentication');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'vitfoodguide2026' })
  });

  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert.ok(token, 'Admin login must return auth token');
  console.log('[PASS] Admin login succeeded and token received');

  // Test 6: Admin Retrieves Suggestions
  console.log('\nTest 6: Admin views submitted suggestions');
  const adminRes = await fetch(`${BASE_URL}/api/admin/suggestions?status=pending`, {
    headers: {
      'x-admin-token': token,
      'Authorization': `Bearer ${token}`
    }
  });

  assert.strictEqual(adminRes.status, 200, 'Admin can view suggestions with 200');
  const adminData = await adminRes.json();
  assert.strictEqual(adminData.success, true);
  assert.ok(adminData.total >= 2, `Should list submitted suggestions (found: ${adminData.total})`);

  const foundSug1 = adminData.data.find(s => s.id === sug1Id);
  assert.ok(foundSug1, 'Admin should see price change suggestion');
  assert.strictEqual(foundSug1.dishName, 'Badham Milk');
  assert.strictEqual(foundSug1.suggestedPrice, 35);
  assert.strictEqual(foundSug1.status, 'pending');

  const foundSug2 = adminData.data.find(s => s.id === sug2Id);
  assert.ok(foundSug2, 'Admin should see new dish suggestion');
  assert.strictEqual(foundSug2.dishName, 'Dragon Fruit Smoothie');
  assert.strictEqual(foundSug2.suggestedPrice, 70);
  console.log(`[PASS] Admin retrieved ${adminData.total} pending suggestions with correct dish names, prices & notes`);

  // Test 7: Admin marks suggestion as Applied
  console.log('\nTest 7: Admin marks suggestion as Applied');
  const applyRes = await fetch(`${BASE_URL}/api/admin/suggestions/${sug1Id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'applied' })
  });

  assert.strictEqual(applyRes.status, 200, 'Update status should return 200');
  const applyData = await applyRes.json();
  assert.strictEqual(applyData.success, true);
  assert.strictEqual(applyData.data.status, 'applied');
  console.log('[PASS] Suggestion 1 status updated to "applied"');

  // Test 8: Admin marks suggestion as Dismissed
  console.log('\nTest 8: Admin marks suggestion as Dismissed');
  const dismissRes = await fetch(`${BASE_URL}/api/admin/suggestions/${sug2Id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'dismissed' })
  });

  assert.strictEqual(dismissRes.status, 200, 'Dismiss status should return 200');
  const dismissData = await dismissRes.json();
  assert.strictEqual(dismissData.data.status, 'dismissed');
  console.log('[PASS] Suggestion 2 status updated to "dismissed"');

  // Test 9: Admin Deletes Suggestion
  console.log('\nTest 9: Admin deletes suggestion record');
  const delRes1 = await fetch(`${BASE_URL}/api/admin/suggestions/${sug1Id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-token': token,
      'Authorization': `Bearer ${token}`
    }
  });
  assert.strictEqual(delRes1.status, 200, 'Delete suggestion 1 should return 200');

  const delRes2 = await fetch(`${BASE_URL}/api/admin/suggestions/${sug2Id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-token': token,
      'Authorization': `Bearer ${token}`
    }
  });
  assert.strictEqual(delRes2.status, 200, 'Delete suggestion 2 should return 200');
  console.log('[PASS] Test suggestion records cleaned up successfully');

  console.log('===============================================================');
  console.log('  ALL 9 SUGGESTION & PRIVACY TESTS PASSED (100%)');
  console.log('===============================================================');
}

runSuggestionsTestSuite().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
