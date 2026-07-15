---
name: vocab-add
description: 스페인어 단어 추가 (새 단어 또는 복습 오답 단어) — 단일 단어장.json 편집부터 웹앱 배포까지 한 번에. "단어 추가해줘", "이 단어들 모르겠어", 단어 목록을 붙여넣을 때 사용.
---

# 단어 추가 워크플로우

먼저 `guide/vocab-anki.md`를 읽는다 (필드 규칙·파일 구조의 기준 문서).

## 절차

1. **대상 파일** — 새 단어든 오답 단어든 전부 루트 `단어장.json` **단일 파일**에 추가한다. (오답 복습은 웹앱 마스터리 레벨이 담당하므로 별도 풀 파일은 없다.)
2. **중복 확인** — `단어장.json`을 읽고 `es` 기준으로 이미 있는 단어는 건너뛴다.
3. **항목 작성** — 7개 필드(`es` `en` `ko` `ex` `ex_ko` `note` `category`)를 전부 채운다. 규칙은 `guide/vocab-anki.md`의 "단어 1개의 JSON 필드" 절을 그대로 따른다. 특히:
   - `ex_ko` 생략 금지
   - `category`는 통제 어휘만 (verb/noun/adjective/adverb/number/ordinal/direction, 애매하면 null)
   - 예문은 담백한 사실 기반
4. **JSON 유효성 검증** — 편집 후 `node -e "JSON.parse(require('fs').readFileSync('<파일>', 'utf8'))"` 등으로 파싱이 되는지 확인한다.
5. **빌드 + 배포** — `/vocab-sync` 스킬의 절차를 이어서 실행한다 (build_web.js → commit → push). cowork 등 push 불가 환경이면 여기서 멈추고 "다음 Claude Code 세션에서 /vocab-sync 필요"라고 알린다.
6. **보고** — 추가된 단어 수, 빌드 후 총 단어 수를 알린다.
