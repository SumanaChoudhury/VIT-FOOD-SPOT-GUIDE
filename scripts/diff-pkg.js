const fs = require('fs');
const path = require('path');

function diffFiles(f1, f2) {
  const c1 = fs.readFileSync(f1, 'utf8');
  const c2 = fs.readFileSync(f2, 'utf8');
  console.log(`Diff for ${path.basename(f1)}: identical = ${c1 === c2}`);
  if (c1 !== c2) {
    console.log(`  f1 length: ${c1.length}, f2 length: ${c2.length}`);
  }
}

diffFiles('temp_orig/[Content_Types].xml', 'temp_template/[Content_Types].xml');
diffFiles('temp_orig/_rels/.rels', 'temp_template/_rels/.rels');
diffFiles('temp_orig/word/_rels/document.xml.rels', 'temp_template/word/_rels/document.xml.rels');
diffFiles('temp_orig/word/settings.xml', 'temp_template/word/settings.xml');
diffFiles('temp_orig/word/styles.xml', 'temp_template/word/styles.xml');
diffFiles('temp_orig/word/fontTable.xml', 'temp_template/word/fontTable.xml');
diffFiles('temp_orig/word/webSettings.xml', 'temp_template/word/webSettings.xml');
