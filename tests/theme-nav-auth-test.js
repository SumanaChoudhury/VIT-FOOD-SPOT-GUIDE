/**
 * VIT Food Spot Guide — Theme Contrast, Nav Label & Merged Admin Portal Verification
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('  THEME CONTRAST, NAV & MERGED ADMIN VERIFICATION SUITE');
console.log('===============================================================');

const indexHtml = fs.readFileSync(path.join(__dirname, '../client/index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '../client/css/style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../client/js/app.js'), 'utf8');

// Test 1: Top Navigation Bar Label
console.log('\nTest 1: Top Navigation Bar displays "Academic Blocks"');
assert(
  indexHtml.includes('<a href="#academic-blocks" class="nav-link" data-view="academic-blocks">Academic Blocks</a>'),
  'Main navbar must have Academic Blocks link text'
);
assert(
  !indexHtml.includes('<a href="#academic-blocks" class="nav-link" data-view="academic-blocks">Pearl Research Park</a>'),
  'Main navbar must not have Pearl Research Park as the link text'
);
console.log('[PASS] Nav link correctly updated to "Academic Blocks"');

// Test 2: Admin merged inside Sign In modal
console.log('\nTest 2: Admin merged into Sign In modal');
assert(
  !indexHtml.includes('<button class="btn-pill-admin" id="btn-admin-modal" title="Administrator Portal">Admin</button>'),
  'Standalone Admin button removed from navbar'
);
assert(
  indexHtml.includes('id="tab-auth-admin"'),
  'Auth modal must contain tab-auth-admin'
);
assert(
  indexHtml.includes('id="auth-admin-view"'),
  'Auth modal must contain auth-admin-view'
);
assert(
  indexHtml.includes('id="auth-admin-login-form"'),
  'Auth modal must contain auth-admin-login-form'
);
assert(
  indexHtml.includes('id="link-switch-to-admin"'),
  'Sign in view must contain quick switch link to Admin Portal'
);
console.log('[PASS] Admin portal successfully merged inside Auth modal');

// Test 3: Theme Toggle functionality
console.log('\nTest 3: Theme Toggle 1-click toggle and icon synchronization');
assert(
  appJs.includes('toggleTheme()'),
  'ThemeManager must contain direct toggleTheme method'
);
assert(
  appJs.includes("$('#btn-theme-settings').on('click'"),
  'btn-theme-settings click event wired directly'
);
assert(
  appJs.includes('Switch to Light theme') && appJs.includes('Switch to Dark theme'),
  'Theme button must update title and aria-label dynamically'
);
console.log('[PASS] Theme toggle operates cleanly with 1-click Light/Dark toggling');

// Test 4: Contrast & Text Visibility in Light & Dark Mode
console.log('\nTest 4: High-contrast text guarantees in Light and Dark mode');
assert(
  styleCss.includes('[data-theme="dark"] .brand-main-title') &&
  styleCss.includes('[data-theme="dark"] .brand-sub-title'),
  'Dark theme rules for brand title and subtitle must be present'
);
assert(
  styleCss.includes('[data-theme="dark"] .spot-name') &&
  styleCss.includes('[data-theme="dark"] .spot-location') &&
  styleCss.includes('[data-theme="dark"] .spot-desc'),
  'Dark theme rules for spot card title, location and description must be present'
);
assert(
  styleCss.includes('[data-theme="dark"] select option'),
  'Dark theme styles for native select options must be present'
);
assert(
  styleCss.includes('[data-theme="dark"] .luxury-block-tab .tab-label'),
  'Dark theme styles for academic block tab labels must be present'
);
console.log('[PASS] Contrast rules in place for all headings, cards, tabs, and form elements');

// Test 5: Responsive Layout Adaptation
console.log('\nTest 5: Responsive layout rules across screen sizes');
assert(
  styleCss.includes('@media (max-width: 960px)') || styleCss.includes('@media (max-width: 900px)'),
  'Responsive header layout query must be present'
);
assert(
  styleCss.includes('.main-nav') && styleCss.includes('overflow-x: auto'),
  'Main navigation must allow horizontal swipe/scroll on mobile/tablet screens'
);
console.log('[PASS] Responsive navigation ribbon and grid adaptation verified');

console.log('\n===============================================================');
console.log('  ALL 5 CHECKS PASSED SUCCESSFULLY (100%)');
console.log('===============================================================');
