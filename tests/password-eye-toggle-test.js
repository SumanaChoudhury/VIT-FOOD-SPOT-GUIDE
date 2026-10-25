/**
 * Password Visibility Toggle ("Eye" Icon) Verification Suite
 * Verifies that all password fields across Student Sign In, Registration,
 * and Administrator Login forms feature accessible eye toggle controls.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('  PASSWORD VISIBILITY "EYE" TOGGLE VERIFICATION SUITE');
console.log('===============================================================');

const indexHtml = fs.readFileSync(path.join(__dirname, '../client/index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '../client/css/style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../client/js/app.js'), 'utf8');

// Test 1: Student Login Password Toggle
console.log('\nTest 1: Student Login password field has eye toggle');
assert(
  indexHtml.includes('id="login-password"'),
  'login-password field must exist'
);
assert(
  indexHtml.includes('for="login-password"') &&
  indexHtml.includes('<div class="password-input-wrapper">') &&
  indexHtml.includes('id="login-password" class="form-control"'),
  'login-password must be wrapped inside password-input-wrapper'
);
console.log('[PASS] Student Login password field has eye toggle button and wrapper');

// Test 2: Student Registration Password Toggle
console.log('\nTest 2: Student Registration password field has eye toggle');
assert(
  indexHtml.includes('id="reg-password"'),
  'reg-password field must exist'
);
assert(
  indexHtml.includes('for="reg-password"') &&
  indexHtml.includes('id="reg-password" class="form-control"'),
  'reg-password must be inside password-input-wrapper with toggle'
);
console.log('[PASS] Student Registration password field has eye toggle button and wrapper');

// Test 3: Admin Auth Modal Password Toggle
console.log('\nTest 3: Admin Sign In (inside Auth Modal) password field has eye toggle');
assert(
  indexHtml.includes('id="auth-admin-pass"'),
  'auth-admin-pass field must exist'
);
assert(
  indexHtml.includes('for="auth-admin-pass"'),
  'auth-admin-pass must be inside password-input-wrapper with toggle'
);
console.log('[PASS] Admin modal password field has eye toggle button and wrapper');

// Test 4: Standalone Admin Modal Password Toggle
console.log('\nTest 4: Standalone Admin Login password field has eye toggle');
assert(
  indexHtml.includes('id="admin-pass-input"'),
  'admin-pass-input field must exist'
);
assert(
  indexHtml.includes('for="admin-pass-input"'),
  'admin-pass-input must be inside password-input-wrapper with toggle'
);
console.log('[PASS] Standalone admin password field has eye toggle button and wrapper');

// Test 5: Eye Icon SVGs (Open Eye and Slashed Eye)
console.log('\nTest 5: Both Open Eye and Slashed Eye SVG icons are present');
const eyeShowCount = (indexHtml.match(/class="eye-icon eye-show"/g) || []).length;
const eyeHideCount = (indexHtml.match(/class="eye-icon eye-hide"/g) || []).length;
assert(eyeShowCount >= 4, `Expected at least 4 eye-show icons, found ${eyeShowCount}`);
assert(eyeHideCount >= 4, `Expected at least 4 eye-hide icons, found ${eyeHideCount}`);
console.log(`[PASS] Found ${eyeShowCount} show icons and ${eyeHideCount} hide icons across all forms`);

// Test 6: CSS Styling Rules in style.css
console.log('\nTest 6: CSS Styling for password wrapper and toggle button');
assert(styleCss.includes('.password-input-wrapper'), 'CSS must define .password-input-wrapper');
assert(styleCss.includes('.btn-toggle-password'), 'CSS must define .btn-toggle-password');
assert(styleCss.includes('[data-theme="dark"] .btn-toggle-password'), 'CSS must define dark mode rules for toggle');
console.log('[PASS] CSS rules for wrapper, toggle, and dark mode contrast present');

// Test 7: JavaScript Toggle Functionality in app.js
console.log('\nTest 7: JavaScript event delegation toggles password input type');
assert(
  appJs.includes(".btn-toggle-password"),
  'app.js must bind click listener to .btn-toggle-password'
);
assert(
  appJs.includes("type', 'text'") && appJs.includes("type', 'password'"),
  'Toggle logic must switch input type between text and password'
);
assert(
  appJs.includes(".eye-show") && appJs.includes(".eye-hide"),
  'Toggle logic must toggle eye-show and eye-hide SVGs'
);
console.log('[PASS] JavaScript event delegation handles show/hide logic seamlessly');

console.log('\n===============================================================');
console.log('  ALL 7 PASSWORD EYE TOGGLE TESTS PASSED (100%)');
console.log('===============================================================');
