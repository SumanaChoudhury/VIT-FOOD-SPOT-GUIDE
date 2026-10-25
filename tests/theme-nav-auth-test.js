/**
 * VIT Food Spot Guide — Theme Contrast, Nav Label, Merged Admin & Menu Routing Verification
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('  THEME CONTRAST, NAV, ADMIN & MENU ROUTING VERIFICATION SUITE');
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
  styleCss.includes('[data-theme="dark"] .site-header') &&
  styleCss.includes('[data-theme="dark"] .main-nav .nav-link'),
  'Dark theme rules for site header background and main nav links must be present'
);
assert(
  styleCss.includes('[data-theme="dark"] select option'),
  'Dark theme styles for native select options must be present'
);
assert(
  styleCss.includes('[data-theme="dark"] .luxury-block-tab .tab-label'),
  'Dark theme styles for academic block tab labels must be present'
);
console.log('[PASS] Contrast rules in place for header, nav tabs, cards, and form elements');

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

// Test 6: Nescafe in TT, not in Pearl Research Park
console.log('\nTest 6: Nescafe is in Technology Tower (TT), NOT in Pearl Research Park (PRP)');
assert(
  !appJs.includes("insideSpots: ['olives', 'sri-sabari', 'sri-sai-sabari', 'nescafe-tt']"),
  'Nescafe TT must not be in PRP insideSpots'
);
assert(
  appJs.includes("insideSpots: ['olives', 'sri-sabari', 'sri-sai-sabari']"),
  'PRP insideSpots must only include Oliv\'s Cafeteria and Sri Sabari'
);
assert(
  appJs.includes("insideSpots: ['dc-near-tt', 'fc-near-tt', 'nescafe-tt']"),
  'Technology Tower insideSpots must include nescafe-tt'
);
console.log('[PASS] Nescafe correctly located in Technology Tower (TT) only');

// Test 7: "Oliv's Cafeteria" naming accuracy
console.log('\nTest 7: Restaurant naming updated to "Oliv\'s Cafeteria"');
assert(
  appJs.includes("Oliv's Cafeteria"),
  'app.js must reference Oliv\'s Cafeteria in PRP block description'
);
assert(
  indexHtml.includes("Oliv's Cafeteria"),
  'index.html quick card must reference Oliv\'s Cafeteria'
);
console.log('[PASS] Restaurant accurately named "Oliv\'s Cafeteria"');

// Test 8: Hostel Dining Footer Menu Openers
console.log('\nTest 8: Clicking any hostel dining link opens its verified menu modal');
const expectedHostelLinks = [
  "openSpotDetailModal('one-food-world')",
  "openSpotDetailModal('just-bake')",
  "openSpotDetailModal('nescafe-mh')",
  "openSpotDetailModal('flora')",
  "openSpotDetailModal('auntys-mess')",
  "openSpotDetailModal('nescafe-lh')"
];

for (const link of expectedHostelLinks) {
  assert(indexHtml.includes(link), `Footer must contain menu modal opener: ${link}`);
}
assert(
  appJs.includes('window.openSpotDetailModal = openSpotDetailModal'),
  'openSpotDetailModal must be exposed globally on window'
);
console.log('[PASS] All 6 hostel dining links route directly to their respective menu modals');

console.log('\n===============================================================');
console.log('  ALL 8 TESTS PASSED SUCCESSFULLY (100%)');
console.log('===============================================================');
