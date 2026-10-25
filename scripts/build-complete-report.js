const fs = require('fs');
const path = require('path');

console.log('Generating VIT Food Spot Guide Academic Project Report...');

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// OpenXML Helpers
function p(text, opts = {}) {
  const jc = opts.jc || 'both';
  const sz = opts.sz || 24; // 12pt default
  const bold = opts.bold ? '<w:b/><w:bCs/>' : '';
  const italic = opts.italic ? '<w:i/><w:iCs/>' : '';
  const before = opts.before !== undefined ? opts.before : 120;
  const after = opts.after !== undefined ? opts.after : 120;
  const line = opts.line !== undefined ? opts.line : 360; // 1.5 line spacing
  const indent = opts.indent ? `<w:ind w:left="${opts.indent}"/>` : '';
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : '';

  return `<w:p>
    <w:pPr>
      <w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>
      <w:jc w:val="${jc}"/>
      ${indent}
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        ${bold}${italic}${color}
        <w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>
      </w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        ${bold}${italic}${color}
        <w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>
      </w:rPr>
      <w:t xml:space="preserve">${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function runsP(runsArray, opts = {}) {
  const jc = opts.jc || 'both';
  const before = opts.before !== undefined ? opts.before : 120;
  const after = opts.after !== undefined ? opts.after : 120;
  const line = opts.line !== undefined ? opts.line : 360;
  const indent = opts.indent ? `<w:ind w:left="${opts.indent}"/>` : '';

  let runsXml = '';
  runsArray.forEach(r => {
    const sz = r.sz || opts.sz || 24;
    const bold = r.bold ? '<w:b/><w:bCs/>' : '';
    const italic = r.italic ? '<w:i/><w:iCs/>' : '';
    const font = r.font || 'Times New Roman';
    const color = r.color ? `<w:color w:val="${r.color}"/>` : '';
    runsXml += `<w:r>
      <w:rPr>
        <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
        ${bold}${italic}${color}
        <w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>
      </w:rPr>
      <w:t xml:space="preserve">${escapeXml(r.text)}</w:t>
    </w:r>`;
  });

  return `<w:p>
    <w:pPr>
      <w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>
      <w:jc w:val="${jc}"/>
      ${indent}
    </w:pPr>
    ${runsXml}
  </w:p>`;
}

function heading1(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="280" w:after="140" w:line="360" w:lineRule="auto"/>
      <w:jc w:val="left"/>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="30"/><w:szCs w:val="30"/>
      </w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="30"/><w:szCs w:val="30"/>
      </w:rPr>
      <w:t xml:space="preserve">${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function heading2(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="220" w:after="100" w:line="360" w:lineRule="auto"/>
      <w:jc w:val="left"/>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="26"/><w:szCs w:val="26"/>
      </w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="26"/><w:szCs w:val="26"/>
      </w:rPr>
      <w:t xml:space="preserve">${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function heading3(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="160" w:after="80" w:line="360" w:lineRule="auto"/>
      <w:jc w:val="left"/>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="24"/><w:szCs w:val="24"/>
      </w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="24"/><w:szCs w:val="24"/>
      </w:rPr>
      <w:t xml:space="preserve">${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function pageBreak() {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

function bullet(text, boldPrefix = '') {
  if (boldPrefix) {
    return runsP([
      { text: '•  ' + boldPrefix + ' ', bold: true, sz: 24 },
      { text: text, bold: false, sz: 24 }
    ], { indent: 720, before: 60, after: 60, line: 360, jc: 'both' });
  }
  return p('•  ' + text, { indent: 720, before: 60, after: 60, line: 360, jc: 'both' });
}

function tableXml(rowsData, colWidthsDxa, opts = {}) {
  const isHeaderRow = opts.hasHeader !== false;
  let rowsXml = '';

  rowsData.forEach((row, ri) => {
    let cellsXml = '';
    const isHeader = isHeaderRow && ri === 0;

    row.forEach((cellText, ci) => {
      const width = colWidthsDxa[ci] || 2000;
      const jc = isHeader ? 'center' : (opts.alignCols ? (opts.alignCols[ci] || 'left') : 'left');
      const bold = isHeader || (opts.boldCols && opts.boldCols[ci]);
      const sz = opts.sz || 20; // 10pt for tables
      const shd = isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="EBF1EB"/>' : '';

      cellsXml += `<w:tc>
        <w:tcPr>
          <w:tcW w:w="${width}" w:type="dxa"/>
          ${shd}
          <w:tcMar>
            <w:top w:w="120" w:type="dxa"/>
            <w:bottom w:w="120" w:type="dxa"/>
            <w:left w:w="160" w:type="dxa"/>
            <w:right w:w="160" w:type="dxa"/>
          </w:tcMar>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:before="60" w:after="60" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="${jc}"/>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
              ${bold ? '<w:b/><w:bCs/>' : ''}
              <w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>
            </w:rPr>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
              ${bold ? '<w:b/><w:bCs/>' : ''}
              <w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(cellText)}</w:t>
          </w:r>
        </w:p>
      </w:tc>`;
    });

    rowsXml += `<w:tr>
      <w:trPr>
        <w:cantSplit/>
        ${isHeader ? '<w:tblHeader/>' : ''}
      </w:trPr>
      ${cellsXml}
    </w:tr>`;
  });

  return `<w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="0" w:type="auto"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="A0B0A0"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="A0B0A0"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="A0B0A0"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="A0B0A0"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D0DDD0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D0DDD0"/>
      </w:tblBorders>
      <w:tblLayout w:type="fixed"/>
    </w:tblPr>
    ${rowsXml}
  </w:tbl>`;
}

function codeBlock(codeStr, language = '') {
  const lines = codeStr.trim().split('\n');
  let paras = '';
  lines.forEach(l => {
    paras += `<w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="220" w:lineRule="auto"/>
        <w:jc w:val="left"/>
        <w:rPr>
          <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>
          <w:sz w:val="18"/><w:szCs w:val="18"/>
          <w:color w:val="1D2922"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>
          <w:sz w:val="18"/><w:szCs w:val="18"/>
          <w:color w:val="1D2922"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(l)}</w:t>
      </w:r>
    </w:p>`;
  });

  return `<w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="8300" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="72947E"/>
        <w:left w:val="single" w:sz="18" w:space="0" w:color="315C45"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="72947E"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="72947E"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="8300" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="F8FAF8"/>
          <w:tcMar>
            <w:top w:w="140" w:type="dxa"/>
            <w:bottom w:w="140" w:type="dxa"/>
            <w:left w:w="180" w:type="dxa"/>
            <w:right w:w="180" w:type="dxa"/>
          </w:tcMar>
        </w:tcPr>
        ${paras}
      </w:tc>
    </w:tr>
  </w:tbl>`;
}

function imageFigure(rId, figNum, caption, cx = 5200000, cy = 3250000) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="180" w:after="80" w:line="240" w:lineRule="auto"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="${rId.replace(/\D/g, '') || '1'}" name="Figure ${figNum}"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="Figure ${figNum}"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${rId}" cstate="print"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>
  <w:p>
    <w:pPr>
      <w:spacing w:before="60" w:after="220" w:line="240" w:lineRule="auto"/>
      <w:jc w:val="center"/>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="22"/><w:szCs w:val="22"/>
      </w:rPr>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:sz w:val="22"/><w:szCs w:val="22"/>
      </w:rPr>
      <w:t xml:space="preserve">Figure ${escapeXml(figNum)}: ${escapeXml(caption)}</w:t>
    </w:r>
  </w:p>`;
}

console.log('OpenXML helpers loaded.');
