const fs = require('fs');
const orig = fs.readFileSync('temp_orig/[Content_Types].xml', 'utf8');

// Insert png default cleanly after <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
const fixed = orig.replace(
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="png" ContentType="image/png"/>'
);

fs.writeFileSync('temp_template/[Content_Types].xml', fixed, 'utf8');
console.log('Fixed [Content_Types].xml in temp_template!');
