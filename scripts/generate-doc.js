const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting VIT Food Spot Guide Report Generator...');

const TEMPLATE_DIR = path.resolve(__dirname, '..', 'temp_template');
const MEDIA_DIR = path.join(TEMPLATE_DIR, 'word', 'media');
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');
const USER_UPLOADED_DIR = 'C:\\Users\\pavit\\.gemini\\antigravity\\brain\\848482f5-325b-43fa-8ccc-5806d0af9a28\\.user_uploaded';

// 1. Copy screenshots to temp_template/word/media/
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const screenshotFiles = [
  'fig6_1_explore_light.png',
  'fig6_2_explore_dark.png',
  'fig6_3_search_results.png',
  'fig6_4_food_spot_card.png',
  'fig6_5_menu_modal.png',
  'fig6_6_mens_hostel.png',
  'fig6_7_ladies_hostel.png',
  'fig6_8_academic_blocks.png',
  'fig6_9_ai_chatbot.png',
  'fig6_10_feedback_form.png',
  'fig6_11_student_reviews.png',
  'fig6_12_favorites.png',
  'fig6_13_auth_modal.png',
  'fig6_14_admin_portal.png'
];

screenshotFiles.forEach(file => {
  const src = path.join(SCREENSHOTS_DIR, file);
  const dest = path.join(MEDIA_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to media directory.`);
  } else {
    console.warn(`Warning: Screenshot ${src} not found.`);
  }
});

// Copy map if available
const mapSrc = path.join(USER_UPLOADED_DIR, 'media_1792853081637_34a23f5d.jpg');
const mapDest = path.join(MEDIA_DIR, 'vit_campus_map.jpg');
if (fs.existsSync(mapSrc)) {
  fs.copyFileSync(mapSrc, mapDest);
  console.log('Copied campus map to media directory.');
}

// 2. Update [Content_Types].xml
const contentTypesPath = path.join(TEMPLATE_DIR, '[Content_Types].xml');
let contentTypesXml = fs.readFileSync(contentTypesPath, 'utf8');
if (!contentTypesXml.includes('Extension="png"')) {
  contentTypesXml = contentTypesXml.replace('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="png" ContentType="image/png"/>');
  fs.writeFileSync(contentTypesPath, contentTypesXml, 'utf8');
  console.log('Updated [Content_Types].xml with PNG extension.');
}

// 3. Update word/_rels/document.xml.rels
const relsPath = path.join(TEMPLATE_DIR, 'word', '_rels', 'document.xml.rels');
let relsXml = fs.readFileSync(relsPath, 'utf8');

const newRels = [
  { id: 'rId101', target: 'media/fig6_1_explore_light.png' },
  { id: 'rId102', target: 'media/fig6_2_explore_dark.png' },
  { id: 'rId103', target: 'media/fig6_3_search_results.png' },
  { id: 'rId104', target: 'media/fig6_4_food_spot_card.png' },
  { id: 'rId105', target: 'media/fig6_5_menu_modal.png' },
  { id: 'rId106', target: 'media/fig6_6_mens_hostel.png' },
  { id: 'rId107', target: 'media/fig6_7_ladies_hostel.png' },
  { id: 'rId108', target: 'media/fig6_8_academic_blocks.png' },
  { id: 'rId109', target: 'media/fig6_9_ai_chatbot.png' },
  { id: 'rId110', target: 'media/fig6_10_feedback_form.png' },
  { id: 'rId111', target: 'media/fig6_11_student_reviews.png' },
  { id: 'rId112', target: 'media/fig6_12_favorites.png' },
  { id: 'rId113', target: 'media/fig6_13_auth_modal.png' },
  { id: 'rId114', target: 'media/fig6_14_admin_portal.png' },
  { id: 'rId115', target: 'media/vit_campus_map.jpg' }
];

let addedRelCount = 0;
newRels.forEach(rel => {
  if (!relsXml.includes(`Id="${rel.id}"`)) {
    const relTag = `<Relationship Id="${rel.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${rel.target}"/>`;
    relsXml = relsXml.replace('</Relationships>', `${relTag}</Relationships>`);
    addedRelCount++;
  }
});
fs.writeFileSync(relsPath, relsXml, 'utf8');
console.log(`Updated document.xml.rels with ${addedRelCount} image relationships.`);

console.log('Setup completed successfully.');
