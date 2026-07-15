# 📚 Estudio Español — 스페인어 단어장 웹앱 (개인 학습용)

스페인어 단어를 **휴대폰에서 바로 복습**하기 위한 정적 웹앱. 단어를 JSON에 추가하고 빌드 → git pages로 배포. 별도 백엔드·DB 없음. (단어 수 추가시 추후 SQLite DB 추가 예정)

🔗 **배포 주소:** https://11yubin.github.io/estudio-espanol/

---

## ✨ 기능

단어는 **4단계 마스터리 레벨**로 관리된다: `학습중 → 적당히앎 → 거의앎 → 완전터득`. 카드·복습 두 채널에서 한 번에 ±1단계씩 오르내린다.

**표 뷰**
- 스페인어 / 영어 / 한국어 통합 검색
- 분류 · 상태별 필터
- 예문 옆 **"해석" 토글** — 누르면 한국어 해석(`ex_ko`)이 펼쳐짐
- 각 단어의 마스터리 뱃지 + 인라인 **복구 / 승급** 버튼

**카드 뷰 (플래시카드)**
- 탭하면 앞/뒤 뒤집기, 🔀 셔플, **상태·분류별 덱 구성**
- 뒷면 예문에 **"해석 보기"** 토글
- **`Lo sé`(안다) / `No lo sé`(모른다)** 두 버튼 — 안다=한 단계 승급, 모른다=한 단계 강등, 자동으로 다음 카드

**복습 뷰 — 빈칸 퀴즈**
- 익힌 단어(학습중 제외)의 예문에 빈칸을 뚫어 출제
- **`정답 보기`를 눌러야** 정답이 공개된다(자가채점) → 맞으면 한 단계 승급, 틀리면 한 단계 강등

**기타**
- PWA — 홈 화면에 추가해 앱처럼 사용 (`manifest.json` + 아이콘)
- 다크 모드 자동 대응, 모바일 최적화 반응형

> 마스터리 레벨은 서버가 아니라 **브라우저 localStorage**에 저장된다. 즉 **기기·브라우저마다 독립적**이며, 다른 폰에서 접속하면 초기화된 상태로 보인다.

---

## 🗂 프로젝트 구조

```
.
├── 단어장.json               # 유일한 단어 소스 (모든 단어)
├── build_web.js              # 단어장.json → docs/data.json (웹앱용)
├── build_단어장.js           # 단어장.json → 단어장_1.docx (인쇄 복습용)
├── docs/                     # ← GitHub Pages 서빙 루트
│   ├── index.html            # 웹앱 (단일 파일, 표/카드/복습 3탭)
│   ├── data.json             # 빌드 산출물 (직접 편집 금지)
│   ├── .nojekyll             # Jekyll 빌드 우회 (지우지 말 것)
│   ├── manifest.json         # PWA 매니페스트
│   └── icon-192.svg / icon-512.svg
├── 단어장/                   # (은퇴) 과거 Anki TSV 기록만 보존
└── guide/                    # 워크플로우·튜터 가이드 (튜터 세션용)
```

---

## 🧩 데이터 스키마

소스 JSON(`단어장.json`)의 각 항목:

```json
{
  "es": "tener",
  "en": "to have",
  "ko": "가지다",
  "ex": "Tengo un perro.",
  "ex_ko": "나는 개를 한 마리 가지고 있다.",
  "note": "불규칙 동사 ...",
  "category": "verb"
}
```

| 필드 | 설명 |
|---|---|
| `es` / `en` / `ko` | 스페인어 표제어 / 영어 뜻 / 한국어 뜻 |
| `ex` | 예문 (담백한 사실 기반) |
| `ex_ko` | **예문의 한국어 해석** — 웹앱 "해석" 토글에 노출. 단어 추가 시 매번 채운다 |
| `note` | 변형·용법 메모 (없으면 `null`) |
| `category` | 분류 태그 (없으면 `null`). 통제 어휘 사용 |
| `round` | **소스에 넣지 않는다** — `build_web.js`가 전 단어에 `wb1` 자동 부여(단일 파일이라 사실상 고정) |

**`category` 통제 어휘** (docx 색상 뱃지 + 웹앱 분류 필터 공용):

| 품사 | 테마 |
|---|---|
| `verb` 동사 · `noun` 명사 · `adjective` 형용사 · `adverb` 부사 | `number` 수사 · `ordinal` 서수 · `direction` 방향 |

새 테마(예: 색깔·요일)가 필요하면 슬러그를 정하고 `docs/index.html`의 `CATEGORY_LABELS`와 `build_단어장.js`의 `CATEGORY_LABELS`에 라벨을 함께 추가한다.

---

## 🔧 빌드

```bash
npm install          # 최초 1회 (docx 의존성)

npm run build:web    # 소스 JSON → docs/data.json
npm run build:docx   # 단어장.json → 단어장_1.docx (인쇄용 표)
```

`build_web.js` 동작:
1. `단어장.json`을 읽어 전 단어에 `round: wb1` 부여
2. `es` 기준 **중복 제거**(null 필드는 이전 값으로 백필)
3. 알파벳순 정렬 후 `docs/data.json`으로 출력

`docs/data.json`은 산출물이므로 **직접 편집하지 말고** 항상 소스 JSON을 고친 뒤 재빌드한다.

---

## 🚀 배포 (GitHub Pages)

Pages는 **`main` 브랜치의 `/docs` 폴더**를 서빙한다(Deploy from a branch 모드). 별도 Actions 워크플로우 없이, `docs/`를 커밋해 push하면 GitHub 내장 배포가 자동으로 반영한다.

```bash
node build_web.js          # 또는 npm run build:web
git add -A
git commit -m "vocab: 단어 추가"
git push                   # → 잠시 후 사이트에 반영
```

로컬 미리보기:

```bash
cd docs
python3 -m http.server 8000
# http://localhost:8000 접속
```

---

## ➕ 단어 추가 워크플로우 (요약)

1. `단어장.json`에 항목 추가 — `ex_ko`는 **반드시** 같이 채우고, 분류가 명확하면 `category`도 채운다.
2. `npm run build:web`으로 `docs/data.json` 갱신.
3. 커밋 & push → 폰에 반영.

자세한 필드 규칙·docx 빌드는 [`guide/vocab-anki.md`](guide/vocab-anki.md), 웹앱 설계 배경은 [`guide/webapp.md`](guide/webapp.md) 참고.

---

## 📄 라이선스

MIT
