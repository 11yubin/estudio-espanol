// 스페인어 단어장 생성기
// 사용법: node build_단어장.js
// 단어 추가: 단어장.json 에 항목 추가 후 실행

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = require('docx');
const fs = require('fs');
const path = require('path');

const CONTENT_WIDTH = 9026;
// 컬럼: 스페인어 | 카테고리 | 영어 뜻 | 한국어 뜻 | 예문
const COL_WIDTHS = [1500, 900, 1700, 1800, 3126];
const HEADERS = ["스페인어 원형", "분류", "영어 뜻", "한국어 뜻", "예문"];

const CATEGORY_LABELS = {
  verb:      { label: "동사",   color: "1A5276" },
  noun:      { label: "명사",   color: "1D6A39" },
  adjective: { label: "형용사", color: "6E2F8A" },
  adverb:    { label: "부사",   color: "7D6608" },
  direction: { label: "방향",   color: "A04000" },
  number:    { label: "수사",   color: "1A5276" },
  ordinal:   { label: "서수",   color: "17527A" },
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: border, bottom: border, left: border, right: border };

function headerCell(text, colIndex) {
  return new TableCell({
    borders,
    width: { size: COL_WIDTHS[colIndex], type: WidthType.DXA },
    shading: { fill: "2E4057", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20, font: "Malgun Gothic" })]
    })]
  });
}

function dataCell(text, colIndex, bold = false, italic = false) {
  return new TableCell({
    borders,
    width: { size: COL_WIDTHS[colIndex], type: WidthType.DXA },
    shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, bold, italic, size: 20, font: "Malgun Gothic" })]
    })]
  });
}

function exCell(ex, ex_ko) {
  const children = [new TextRun({ text: ex, size: 20, font: "Malgun Gothic" })];
  if (ex_ko) {
    children.push(new TextRun({ text: "\n" + ex_ko, size: 17, color: "777777", font: "Malgun Gothic", break: 1 }));
  }
  return new TableCell({
    borders,
    width: { size: COL_WIDTHS[4], type: WidthType.DXA },
    shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children })]
  });
}

function categoryCell(category) {
  const cat = CATEGORY_LABELS[category] || { label: category, color: "888888" };
  return new TableCell({
    borders,
    width: { size: COL_WIDTHS[1], type: WidthType.DXA },
    shading: { fill: cat.color, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: cat.label, bold: true, color: "FFFFFF", size: 18, font: "Malgun Gothic" })]
    })]
  });
}

function noteCell(text) {
  return new TableCell({
    borders,
    columnSpan: 5,
    shading: { fill: "F4F6F9", type: ShadingType.CLEAR },
    margins: { top: 50, bottom: 50, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text: "📌 " + text, size: 17, color: "555555", font: "Malgun Gothic", italic: true })]
    })]
  });
}

function makeTable(words) {
  const rows = [
    new TableRow({ tableHeader: true, children: HEADERS.map((h, i) => headerCell(h, i)) })
  ];
  words.forEach(w => {
    rows.push(new TableRow({
      children: [
        dataCell(w.es, 0, true, true),
        categoryCell(w.category),
        dataCell(w.en, 2),
        dataCell(w.ko, 3),
        exCell(w.ex, w.ex_ko),
      ]
    }));
    if (w.note) rows.push(new TableRow({ children: [noteCell(w.note)] }));
  });
  return new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: COL_WIDTHS, rows });
}

function pageTitle(num) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
    children: [new TextRun({ text: `스페인어 단어장  #${num}`, bold: true, size: 36, font: "Malgun Gothic", color: "2E4057" })]
  });
}

function paginateWords(words, maxRows = 18) {
  const pages = [];
  let current = [];
  let rowCount = 0;
  for (const w of words) {
    const cost = w.note ? 2 : 1;
    if (rowCount + cost > maxRows && current.length > 0) {
      pages.push(current);
      current = [];
      rowCount = 0;
    }
    current.push(w);
    rowCount += cost;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

const pageProps = {
  page: {
    size: { width: 11906, height: 16838 },
    margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
  }
};

const words = JSON.parse(fs.readFileSync(path.join(__dirname, '단어장.json'), 'utf8'));
const pages = paginateWords(words);

const doc = new Document({
  sections: pages.map((pageWords, i) => ({
    properties: pageProps,
    children: [pageTitle(i + 1), makeTable(pageWords)]
  }))
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(path.join(__dirname, '단어장_1.docx'), buf);
  console.log(`완료: ${words.length}개 단어, ${pages.length}페이지`);
});
