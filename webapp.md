# 폰 단어장 웹앱 — 구현 지침 (클로드 코드용)

Anki 수동 임포트가 번거로워서, 단어 추가 시 자동으로 휴대폰에서 볼 수 있는 단어장 웹앱을 만든다.
**이 문서는 설계도다. 이 프로젝트(cowork) 채팅에서는 구현하지 않는다 — 클로드 코드에서 이 파일을 읽고 구현한다.**

## 결정된 사항
- **호스팅:** GitHub Pages (정적 사이트, 무료). 레포 `main` 브랜치의 `/docs` 폴더에서 서빙.
- **UI:** 리스트/표 뷰 + 플래시카드 뷰 **둘 다**. 상단 탭으로 전환.
- **백엔드 없음.** 단어 추가는 어차피 Claude(cowork 또는 클로드 코드)가 파일을 직접 편집하는 방식이라 DB/서버 불필요. "배포"는 `git push` 한 번으로 끝.

## 현재 데이터 구조 (변경하지 않음)
- `단어장.json` — 확정된 회차(현재 1회차) 단어 목록. `{es, en, ko, ex, note}`
- `단어장/단어장_N.json` — 진행 중인 오답 풀(다음 회차 후보). 확정되면 `단어장/anki_N.tsv`로 내보내고 이 회차가 종료됨. (규칙: `guide/vocab-anki.md`)
- 새 회차가 확정되면 `단어장_N.json`(확정본)이 별도로 생길 수도 있음 — 아직 워크플로우상 미확정. 웹앱은 **모든 json 소스를 합친 누적본**을 보여준다.

## 새로 추가할 것

### 1. `build_web.js` (루트)
의존성 없이 순수 Node(`fs`)로 작성 (npm install 불필요, `build_단어장.js`처럼 `docx` 패키지에 의존하지 않게).

동작:
1. `단어장.json` + `단어장/*.json`(패턴 매칭, `단어장_숫자.json` 전부) 을 읽는다.
2. `es` 필드 기준으로 중복 제거 (나중 파일이 우선 — 최신 수정본이 이김).
3. 각 항목에 출처 태그를 붙인다. 예: `단어장.json` → `"round": "wb1"`, `단어장/단어장_2.json` → `"round": "wb2-pool"`.
4. 결과를 `docs/data.json`으로 저장 (배열, 알파벳순 or 추가순 — 알파벳순 추천, 검색 편의).
5. 콘솔에 `총 N개 단어, docs/data.json 갱신 완료` 출력.

### 2. `docs/index.html` (단일 파일 웹앱)
- 빌드 도구 없이 순수 HTML/CSS/JS. `fetch('./data.json')`로 데이터 로드.
- **상단 탭 2개:**
  - **표 뷰:** 스페인어 / 영어 / 한국어 / 예문 컬럼. 검색창(es/en/ko 통합 검색), 회차(`round`) 필터 드롭다운.
  - **플래시카드 뷰:** 카드 탭하면 뒤집혀서 변형/예문/한국어 뜻 표시. 좌우 스와이프 or 버튼으로 다음/이전. 셔플 버튼. "아는 단어" 체크 후 숨기기 기능(선택, 로컬스토리지에 저장 — PWA라 localStorage 사용 가능, cowork 아티팩트 제약과는 무관).
- 모바일 퍼스트 반응형 CSS. 폰 화면 기준으로 먼저 디자인.
- 다크모드는 선택사항(시스템 설정 따라가면 좋음).

### 3. `docs/manifest.json` + 아이콘
- "홈 화면에 추가" 시 앱처럼 보이도록 PWA manifest 추가 (`name`, `short_name`, `start_url`, `display: standalone`, 아이콘 192/512px).
- 아이콘은 간단한 것으로(예: "Es" 텍스트 로고) 만들어도 충분.
- Service worker는 필수 아님(오프라인 캐싱 원하면 추가, 없어도 무방 — 매번 최신 데이터 보려면 오히려 캐싱 없는 게 나음).

### 4. Git + GitHub Pages 배포 (최초 1회, 사용자와 함께 진행)
1. 프로젝트 루트에서 `git init` (아직 git repo 아님, 확인 완료).
2. `.gitignore`에 `*.docx`, `.DS_Store`, PDF 원서 등 불필요한 큰 파일 제외 (`Practice-Makes-Perfect-...pdf`도 저작권상 GitHub에 올리지 않는 게 안전 — 반드시 제외).
3. GitHub에 새 레포 생성 (사용자가 직접, 이름 예: `spanish-vocab-app`, public — Pages 무료 티어는 public 레포 필요).
4. `git remote add origin <repo-url>` → `git push -u origin main`.
5. GitHub 레포 Settings → Pages → Source: `main` 브랜치 `/docs` 폴더로 지정.
6. 생성된 URL(`https://<username>.github.io/<repo>/`)을 아이폰 사파리로 열고 "홈 화면에 추가".

### 5. 기존 워크플로우와 연동
`guide/vocab-anki.md`의 "오답 풀 누적 규칙"에 아래를 추가한다:
- 단어를 풀 파일에 추가한 뒤 **매번** `node build_web.js` 실행 → `docs/data.json` 갱신.
- 변경사항을 `git add -A && git commit -m "단어 추가: ..." && git push` 로 반영 (클로드 코드가 자동 실행, cowork 세션은 git push 자격증명이 없으므로 이 작업은 클로드 코드 전용).
- 즉, **단어장 갱신은 클로드 코드 세션에서만 완결된다.** cowork(이 앱)에서 단어를 추가한 경우, 다음 클로드 코드 세션에서 `build_web.js` 실행 + push를 한 번 해줘야 폰에 반영됨.

## 클로드 코드 구현 순서 (체크리스트)
1. `build_web.js` 작성 + 테스트 실행 (현재 `단어장.json` + `단어장/단어장_2.json`으로 `docs/data.json` 생성 확인).
2. `docs/index.html` 작성 (표 뷰 먼저 → 플래시카드 뷰 추가 → 반응형 스타일 다듬기).
3. `docs/manifest.json` + 아이콘 2종 추가.
4. 로컬에서 `python3 -m http.server` 등으로 `docs/` 열어서 폰 브라우저(같은 wifi)로 목업 테스트.
5. `.gitignore` 작성 → `git init` → 첫 커밋.
6. 사용자에게 GitHub 레포 생성 요청 (레포명 확인) → remote 연결 → push.
7. 사용자에게 Pages 설정(Settings → Pages → `/docs`) 안내.
8. 배포된 URL 확인 후 사용자에게 전달, 홈 화면 추가 안내.
9. `guide/vocab-anki.md`에 위 4번(연동 규칙) 내용 반영해서 수정.

## 미정 사항 (클로드 코드 세션에서 사용자에게 확인)
- GitHub 계정/레포 이름.
- 플래시카드 "아는 단어 숨기기" 기능 원하는지 여부.
- 회차 필터를 UI에 노출할지, 그냥 전체 통합 리스트로만 볼지.
