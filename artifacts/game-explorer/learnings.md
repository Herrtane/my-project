---
category: tooling
applied: rule
---
## jsdom 기반 유닛 테스트는 실제 페인트·스태킹·컨테이너 쿼리를 검증하지 못한다 — 두 번째 재발로 규칙 승격

**상황**: Task 2에서 `@container` 누락으로 3열 그리드가 1열로만 보이는 버그를 발견(빌드·테스트 전부 통과). code-reviewer 단계에서 같은 원인의 두 번째 사례가 나옴: `game-card.tsx`의 순위 배지(`Badge`, `position:absolute`)가 썸네일 이미지 wrapper(`position:relative`, DOM 순서상 나중)에 완전히 가려져 화면에 안 보였는데, `game-card.test.tsx`/`game-grid.test.tsx`/`page.test.tsx` 전부 통과 상태였다. 두 사례 모두 jsdom이 실제 CSS 레이아웃·페인트·stacking context를 계산하지 않아, DOM 구조와 텍스트만 검증하는 Testing Library 테스트로는 절대 못 잡는 유형.
**판단**: 재발 확률이 "높음"이었던 예측이 같은 feature 안에서 실제로 두 번 실현됐으므로 메모 단계를 넘어 규칙으로 승격. `.claude/rules/browser-verify.md`로 반영 — 레이아웃/포지셔닝 변경 후에는 유닛 테스트 통과와 무관하게 실제 브라우저 스크린샷 확인을 거친다.
**다시 마주칠 가능성**: 높음 — 같은 feature 내 2회 발생으로 이미 실증됨.

---
category: escalation
applied: not-yet
---
## Steam 검색 API의 `count` 쿼리 파라미터가 무시됨

**상황**: Task 2, 브라우저로 실제 API 응답을 확인하던 중 `count=20`을 요청했는데 실제로는 25개가 돌아옴을 발견 (plan.md Task 1 수용 기준에는 있었지만 Task 1의 유닛 테스트는 작은 fixture만 써서 이 경계를 실제로 검증하지 못했음).
**판단**: Steam 응답 개수를 신뢰하지 않고, route handler에서 파싱 후 `.slice(0, 20)`으로 서버가 직접 상한을 강제하도록 수정. 회귀 테스트(25개 fixture → 20개로 잘리는지)도 추가.
**다시 마주칠 가능성**: 중간 — 외부 API의 명시적 파라미터가 문서화된 대로 동작하지 않을 수 있다는 것은 일반화 가능한 패턴. 유닛 테스트가 실제 경계값(정확히 20개 초과)을 다루지 않으면 이런 버그가 커밋을 통과한다는 점도 재발 가능.

---
category: tooling
applied: rule
---
## `bun run test`가 Playwright의 `e2e/*.spec.ts`까지 집어서 실행하던 문제

**상황**: Task 2, 전체 테스트 스위트(`bun run test`)를 처음 돌렸을 때 `e2e/smoke.spec.ts`에서 "test() 호출 예상 못함" 에러로 실패. `vitest.config.ts`의 `exclude`가 `node_modules`/`.claude/worktrees`만 막고 `e2e/`는 빠져 있었음 — 템플릿 최초 커밋부터 있던 설정 누락으로, 이번 feature가 처음 전체 스위트를 돌리면서 드러남.
**판단**: `vitest.config.ts` exclude에 `"e2e/**"` 추가. `CLAUDE.md`가 이미 `e2e/*.spec.ts`는 Playwright 전용이라고 명시하고 있어 규칙과 설정을 일치시키는 수정이라 바로 반영.
**다시 마주칠 가능성**: 낮음 — 근본 원인(설정 파일)을 고쳤으므로 이 프로젝트에서는 재발하지 않음.

---
category: spec-ambiguity
applied: discarded
---
## Steam 태그 필터 결과의 일부 게임은 매칭되는 장르 칩이 하나도 없음

**상황**: Task 3, 브라우저에서 "Strategy" 필터를 확인하던 중 Counter-Strike 2·PUBG처럼 필터 결과에는 나오지만 카드에 "Strategy" 태그 칩이 안 뜨는 게임을 발견. Steam 검색이 태그로 필터링할 때 쓰는 전체 태그 집합과, 응답 HTML의 `data-ds-tagids`에 실리는 상위 태그 목록이 서로 다름 — 원인은 Task 1에서 이미 실측했던 것과 같은 데이터 소스 특성.
**판단**: spec.md는 "우리가 지원하는 장르 중 매칭되는 것만 표시"라고만 되어 있고 "최소 1개는 항상 보여야 한다"는 요구는 없어 버그로 보지 않음. 코드 수정 없이 기록만 남김.
**다시 마주칠 가능성**: 낮음 — Steam 데이터 소스 특유의 현상이라 일반화되기보다는 이 feature에서 한 번 이해하고 넘어가면 되는 우연.

---
category: code-review
applied: rule
---
## plan.md가 spec.md의 리터럴 문구를 압축해서 옮기며 표기가 어긋남

**상황**: code-reviewer 검토에서 발견. spec.md 성공 기준은 배지 문구를 "적극 추천"/"신중히 고려"/"정보 부족"(공백 포함)으로 명시하는데, `draft-plan` 단계에서 plan.md 데이터 모델에 옮겨 적을 때 공백 없이 "적극추천"/"신중히고려"/"정보부족"로 압축됐고, `execute-plan`은 plan.md만 보고 그대로 구현·테스트까지 작성해 3/4 배지 문구가 spec과 어긋난 채로 세 커밋(Task 4, 코드 리뷰 전까지)을 통과했다.
**판단**: `lib/recommendation-badge.ts`의 타입 리터럴과 관련 텍스트를 spec.md 원문과 정확히 일치시키고, 영향받은 테스트(unit + e2e)도 함께 수정. `.claude/rules/spec-literal-fidelity.md`로 반영 — spec.md의 사용자 노출 문자열은 plan.md·구현 코드에 원문 그대로 복사한다.
**다시 마주칠 가능성**: 중간 — 사용자에게 보이는 정확한 문자열이 spec.md 성공 기준에 리터럴로 들어있는 feature에서는 재발 가능.

---
category: refactor
applied: not-yet
---
## 외부 응답을 항목 단위로 파싱할 때는 한 항목의 실패가 전체를 죽이지 않게 격리한다

**상황**: code-reviewer 검토에서 발견. `lib/steam-search-parser.ts`가 `results_html`을 항목별로 쪼갠 뒤 `.map(parseItem)`으로 한 번에 처리했는데, 단 하나의 항목이라도 `data-ds-tagids`가 유효하지 않은 JSON이면 `JSON.parse` 예외가 상위로 전파되어 `app/api/games/route.ts`의 catch가 잡고 **응답 전체를 502로 만들었다** — 19개가 정상이어도 1개 때문에 전부 빈 화면.
**판단**: 리스크가 있는 필드(`tagIds`)는 개별 try/catch로 감싸 실패 시 안전한 기본값(`[]`)으로 낮추고, `parseSteamSearchHtml`의 `.map` 콜백에도 항목 단위 try/catch를 한 겹 더 둬 예상 못한 다른 실패도 해당 항목만 제외되게 함.
**다시 마주칠 가능성**: 중간 — 외부 소스(API 응답, 파일 업로드 등)를 배열 단위로 파싱하는 다른 feature에서도 일반화 가능한 패턴("한 항목의 실패 ≠ 전체 실패").
