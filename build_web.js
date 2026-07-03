#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 1. 단어장.json과 단어장/*.json 읽기
const dataDir = __dirname;
const docsPollDir = path.join(dataDir, '단어장');

let allWords = [];

// 단어장.json 읽기
const mainVocabPath = path.join(dataDir, '단어장.json');
if (fs.existsSync(mainVocabPath)) {
  const mainVocab = JSON.parse(fs.readFileSync(mainVocabPath, 'utf-8'));
  allWords.push(...mainVocab.map(word => ({ ...word, round: 'wb1' })));
}

// 단어장/ 폴더의 단어장_N.json 읽기 (정렬된 순서로)
if (fs.existsSync(docsPollDir)) {
  const files = fs.readdirSync(docsPollDir)
    .filter(f => f.match(/^단어장_\d+\.json$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  files.forEach(file => {
    const filePath = path.join(docsPollDir, file);
    const vocab = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const round = file.replace('단어장_', '').replace('.json', '');
    vocab.forEach(word => {
      allWords.push({ ...word, round: `wb${round}-pool` });
    });
  });
}

// 2. es 기준으로 중복 제거 (나중 파일 우선)
const uniqueWords = [];
const seenEs = new Set();
for (let i = allWords.length - 1; i >= 0; i--) {
  const word = allWords[i];
  if (!seenEs.has(word.es)) {
    seenEs.add(word.es);
    uniqueWords.unshift(word);
  }
}

// 3. 알파벳순 정렬
uniqueWords.sort((a, b) => a.es.localeCompare(b.es));

// 4. docs/data.json 저장
const outputPath = path.join(dataDir, 'docs', 'data.json');
fs.writeFileSync(outputPath, JSON.stringify(uniqueWords, null, 2), 'utf-8');

// 5. 콘솔 출력
console.log(`✓ 총 ${uniqueWords.length}개 단어, ${outputPath} 갱신 완료`);
