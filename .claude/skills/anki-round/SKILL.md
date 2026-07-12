---
name: anki-round
description: 오답 풀 마감 — 현재 풀을 Anki TSV로 확정하고 다음 회차 풀을 시작. "Anki로 가자", "회차 마감해줘"일 때 사용.
---

# 오답 풀 마감 (Anki 회차 확정)

먼저 `guide/vocab-anki.md`를 읽는다 (TSV 형식·풀 규칙의 기준 문서).

## 절차

1. `단어장/` 폴더에서 번호가 가장 큰 `단어장_N.json`(현재 풀)을 읽는다. 비어 있으면 마감할 게 없다고 알리고 중단.
2. 풀 전체를 `단어장/anki_N.tsv`로 변환한다:
   - 탭 구분, UTF-8, 컬럼: `Front`(en) / `Back`(es + note 요약 + 예문) / `Tags`(`wbN pool`)
   - 카드 방향은 영어→스페인어, 변형형은 Back에 묶는다.
   - 형식 예시는 `guide/vocab-anki.md`의 "Anki TSV 형식" 절 참고.
3. 다음 풀 파일 `단어장/단어장_N+1.json`을 빈 배열 `[]`로 생성한다.
4. `/vocab-sync` 절차로 빌드+커밋+푸시한다 (커밋 메시지 예: `feat: anki N회차 마감, N+1 풀 시작`).
5. 보고: 마감된 단어 수, TSV 경로, Anki 임포트 방법(File > Import > 구분자 Tab, 첫 필드=Front, HTML 허용 체크), 새 풀 파일명.

## 주의

- 마감 전 TSV를 미리 만들어 두지 않는다 — TSV는 이 스킬에서만 생성한다.
- 기존 회차의 TSV(`anki_1.tsv` 등)는 수정하지 않는다.
