---
name: vocab-sync
description: 단어장 빌드 + 커밋 + 푸시로 폰 웹앱에 반영. 단어 JSON 수정 후, 또는 cowork에서 추가된 단어를 배포할 때 사용. "동기화해줘", "배포해줘", "폰에 반영해줘".
---

# 단어장 동기화·배포

## 절차

1. `git status`와 `git log --oneline -3`으로 현재 상태를 확인한다.
2. 원격과 diverge했을 수 있으니 먼저 `git pull --rebase`로 동기화한다. 충돌이 나면 해결하되, `docs/index.html`의 기능(탭 3개, wordStatus)이 유실되지 않게 주의한다 (`guide/webapp.md`의 "과거 사고" 참고).
3. `node build_web.js` 실행 — 콘솔에 총 단어 수가 출력된다.
4. 소스 단어 수와 대조: `단어장.json` 개수 ≥ `docs/data.json` 개수(중복 제거로 같거나 작음)인지, 빌드 전보다 늘었는지 확인한다.
5. `git add -A && git commit -m "add: 단어 추가"` (다른 성격의 변경이 섞여 있으면 메시지를 실제 내용에 맞게) → `git push`.
6. 푸시 성공을 확인하고 보고: 총 단어 수, 커밋 해시. 1~2분 후 https://11yubin.github.io/estudio-espanol/ 에 반영된다고 안내한다.

## 주의

- `docs/data.json`을 직접 편집하지 마라 — 항상 빌드로 생성.
- `docs/.nojekyll` 삭제 금지.
- push 권한이 없는 환경(cowork)에서는 이 스킬을 완결할 수 없다 — JSON 수정까지만 하고 Claude Code 세션에서 마무리한다.
