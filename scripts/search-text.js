const fs = require('fs');
const path = require('path');

function searchDir(dir, needle) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full, needle);
    } else {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.toLowerCase().includes(needle.toLowerCase())) {
          console.log(`Found in: ${full}`);
        }
      } catch (e) {}
    }
  }
}

searchDir('.', 'student picks for each spot');
searchDir('.', 'view complete menus and student picks');
