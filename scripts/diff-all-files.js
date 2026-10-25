const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else {
      results.push(path.relative(dir, full));
    }
  });
  return results.sort();
}

const fOrig = getFiles('temp_orig');
const fTemp = getFiles('temp_template');

console.log('Files in temp_orig:', fOrig.length);
console.log('Files in temp_template:', fTemp.length);

const extra = fTemp.filter(f => !fOrig.includes(f));
console.log('Extra files in temp_template:', extra);

const missing = fOrig.filter(f => !fTemp.includes(f));
console.log('Missing files in temp_template:', missing);
