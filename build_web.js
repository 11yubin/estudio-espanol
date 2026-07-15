#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 1. 단어장.json 읽기 (단일 소스 파일)
const dataDir = __dirname;

let allWords = [];

const mainVocabPath = path.join(dataDir, '단어장.json');
if (fs.existsSync(mainVocabPath)) {
  const mainVocab = JSON.parse(fs.readFileSync(mainVocabPath, 'utf-8'));
  allWords.push(...mainVocab.map(word => ({ ...word, round: 'wb1' })));
}

// 2. es 기준으로 중복 제거 (나중 파일 우선, 누락 필드는 이전 값으로 백필)
const byEs = new Map();
for (const word of allWords) {
  const prev = byEs.get(word.es);
  if (!prev) {
    byEs.set(word.es, { ...word });
  } else {
    // 나중 항목이 우선하되, null/undefined 필드는 이전 항목 값 유지
    const merged = { ...prev };
    for (const [k, v] of Object.entries(word)) {
      if (v !== null && v !== undefined) merged[k] = v;
    }
    byEs.set(word.es, merged);
  }
}
const uniqueWords = [...byEs.values()];

// 3. 알파벳순 정렬
uniqueWords.sort((a, b) => a.es.localeCompare(b.es));

// 4. docs/data.json 저장
const outputPath = path.join(dataDir, 'docs', 'data.json');
fs.writeFileSync(outputPath, JSON.stringify(uniqueWords, null, 2), 'utf-8');

// 5. 콘솔 출력
console.log(`✓ 총 ${uniqueWords.length}개 단어, ${outputPath} 갱신 완료`);
