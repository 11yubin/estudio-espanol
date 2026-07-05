const fs = require('fs');
const path = require('path');

const threshold = parseInt(process.argv[2] || '20', 10);
if (Number.isNaN(threshold) || threshold <= 0) {
  console.error('Usage: node scripts/check_word_threshold.js <threshold>');
  process.exit(1);
}

const dataDir = __dirname;
const rootDir = path.resolve(dataDir, '..');
const docsDataPath = path.join(rootDir, 'docs', 'data.json');
const vocabDir = path.join(rootDir, '단어장');
const mainVocabPath = path.join(rootDir, '단어장.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectSourceWords() {
  const words = [];
  if (fs.existsSync(mainVocabPath)) {
    words.push(...readJson(mainVocabPath));
  }

  if (fs.existsSync(vocabDir)) {
    const files = fs.readdirSync(vocabDir).filter(f => f.match(/^단어장_\d+\.json$/));
    files.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });
    for (const file of files) {
      words.push(...readJson(path.join(vocabDir, file)));
    }
  }
  return words;
}

function uniqueWordsByEs(words) {
  const seen = new Set();
  const unique = [];
  for (const word of words) {
    if (!seen.has(word.es)) {
      seen.add(word.es);
      unique.push(word);
    }
  }
  return unique;
}

const sourceWords = uniqueWordsByEs(collectSourceWords());
const publishedWords = uniqueWordsByEs(readJson(docsDataPath));

const sourceCount = sourceWords.length;
const publishedCount = publishedWords.length;
const delta = sourceCount - publishedCount;

console.log(`source total: ${sourceCount}`);
console.log(`published total: ${publishedCount}`);
console.log(`new unique words since published: ${delta}`);

if (delta >= threshold) {
  console.log(`✅ Threshold reached: ${delta} new words (>= ${threshold}).`);
  process.exit(0);
}

console.log(`❌ Threshold not reached yet: ${delta} new words (< ${threshold}).`);
process.exit(2);
