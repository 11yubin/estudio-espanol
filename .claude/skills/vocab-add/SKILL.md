---
name: vocab-add
description: 스페인어 단어 추가 (새 단어 또는 Anki 오답 단어) — JSON 편집부터 웹앱 배포까지 한 번에. "단어 추가해줘", "이 단어들 모르겠어", 단어 목록을 붙여넣을 때 사용.
---

# 단어 추가 워크플로우

먼저 `guide/vocab-anki.md`를 읽는다 (필드 규칙·파일 구조의 기준 문서).

## 절차

1. **분류 판단** — 입력된 단어가 어느 쪽인지 정한다:
   - 새로 배우는 단어(교재, 일상) → `단어장.json`(루트)에 추가
   - Anki/복습에서 안 외워진 오답 단어 → `단어장/` 폴더에서 **번호가 가장 큰** `단어장_N.json`(현재 오답 풀)에 추가
   - 애매하면 사용자에게 물어본다.
2. **중복 확인** — 대상 파일을 읽고 `es` 기준으로 이미 있는 단어는 건너뛴다. 오답 단어가 `단어장.json`에 이미 있으면 그 항목(뜻·예문·note·category)을 그대로 풀에 복사한다.
3. **항목 작성** — 7개 필드(`es` `en` `ko` `ex` `ex_ko` `note` `category`)를 전부 채운다. 규칙은 `guide/vocab-anki.md`의 "단어 1개의 JSON 필드" 절을 그대로 따른다. 특히:
   - `ex_ko` 생략 금지
   - `category`는 통제 어휘만 (verb/noun/adjective/adverb/number/ordinal/direction, 애매하면 null)
   - 예문은 담백한 사실 기반
4. **JSON 유효성 검증** — 편집 후 `node -e "JSON.parse(require('fs').readFileSync('<파일>', 'utf8'))"` 등으로 파싱이 되는지 확인한다.
5. **빌드 + 배포** — `/vocab-sync` 스킬의 절차를 이어서 실행한다 (build_web.js → commit → push). cowork 등 push 불가 환경이면 여기서 멈추고 "다음 Claude Code 세션에서 /vocab-sync 필요"라고 알린다.
6. **보고** — 추가된 단어 수, 대상 파일, 빌드 후 총 단어 수를 알린다. 오답 풀에 추가했다면 현재 풀 개수를 알리고("지금 N/~20개"), 18개 이상이면 "/anki-round로 마감할 때가 됐어"라고 제안한다.
