const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Testing image drawing in OpenXML...');

const origDocXml = fs.readFileSync('temp_orig/word/document.xml', 'utf8');
const rootMatch = origDocXml.match(/<w:document\b[\s\S]*?<w:body>/)[0];
const sectPr = origDocXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)[0];

const imgDrawing = `<w:p>
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="2599055" cy="719455"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="10" name="Picture 10"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="10" name="Picture 10"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="rId4" cstate="print"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="2599055" cy="719455"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>`;

const xml = `${rootMatch}${imgDrawing}${sectPr}</w:body></w:document>`;
fs.writeFileSync('temp_orig/word/document.xml', xml, 'utf8');

const testPath = path.resolve(__dirname, '..', 'test_img.docx');
if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('temp_orig', '${testPath}')"`);

const res = execSync(`powershell -ExecutionPolicy Bypass -File scripts\\check-docx.ps1 -DocxPath "${testPath}"`, { encoding: 'utf8' }).trim();
console.log('Result for image drawing:', res);

if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
// Restore original
fs.writeFileSync('temp_orig/word/document.xml', origDocXml, 'utf8');
