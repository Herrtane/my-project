# 게임 탐색기 (game-explorer) 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 장르 필터링 데이터 소스 | Steam 공식 스토어 검색(`store.steampowered.com/search/results`, HTML 파싱) | SteamSpy의 `genre`/`tag` 엔드포인트를 실제로 호출해보니 대부분 빈 응답(`{}`)이었음(실측 확인, `idea.md` 참조). Steam 공식 검색은 태그 필터링 + 인기순 정렬 + 가격/할인/리뷰율을 한 응답에 포함해서 반환함(실측 확인) |
| 외부 API 호출 위치 | Next.js Route Handler(`app/api/games/route.ts`)에서 서버사이드로 호출 | Steam 엔드포인트가 `Access-Control-Allow-Origin` 헤더를 보내지 않아 브라우저에서 직접 호출 시 CORS로 차단됨(실측 확인) |
| 상세 모달 데이터 소스 | 목록 API 응답에 이미 포함된 데이터를 재사용, 별도 상세 API 호출 없음 | Steam 검색 응답 한 항목에 가격/할인/리뷰율이 이미 포함되어 있어 카드 클릭 시 추가 호출이 필요 없음(N+1 호출 회피) |
| 장르 필터 UI 구현 | shadcn `ToggleGroup` (`type="single"`) | 옵션이 9개(전체+8장르)로 shadcn 권장 범위(2-7개)를 살짝 넘지만, "단일 선택" 시맨틱이 동일하게 적합하고 버튼 반복 구현보다 접근성이 보장됨 |
| 장르 태그 표시 | Steam 응답의 `data-ds-tagids`를 우리가 지원하는 8개 장르의 태그ID와 교차 비교해 매칭되는 이름만 카드에 표시 | 추가 API 호출 없이 이미 받은 데이터로 해결 가능 |
| 데이터 캐싱 | Route Handler에서 짧은 `revalidate`(60초) 적용 | 매 요청마다 Steam에 직접 부하를 주지 않으면서도 사실상 실시간처럼 느껴지는 절충안 |
| 추천 배지 "정보 부족" 임계값 | `reviewCount < 10` | Steam 자체 UI가 리뷰 10개 미만일 때 "충분한 평가 없음"으로 처리하는 관례를 그대로 채택 |
| E2E 네트워크 전략 | Playwright에서 `/api/games` 응답을 라우트 인터셉트로 스텁 | 실제 Steam 응답에 의존하면 테스트가 느리고 외부 서비스 상태에 따라 플레이키해짐 |
| 상세 모달 컴포넌트 | shadcn `Dialog` (와이어프레임의 bottom-sheet 스타일 대신) | 이미 설치되어 있고 접근성(포커스 트랩, ESC, Title)을 기본 제공 — 새 의존성(Drawer) 추가 불필요 |
| Steam 요청 통화 고정 | Steam 요청 URL에 `cc=kr` 파라미터 명시 (언어는 `supportedlang=english` 유지) | `cc` 파라미터 없이 호출하면 서버의 지리적 위치(IP)에 따라 통화가 달라짐 — 로컬(한국 IP)에서는 우연히 KRW가 나오지만 배포 리전이 다르면 USD 등으로 바뀔 수 있음(재현 테스트로 확인). `cc=kr`만 추가하면 통화는 KRW로 고정되면서 "Free" 등 라벨은 영어로 유지됨(`l=korean`을 함께 쓰면 "무료"처럼 라벨까지 한국어로 바뀌어 파서가 다국어 라벨을 다뤄야 하므로 제외) |
| Badge/Card 컴포넌트 | 이미 설치되어 있음 (`components/ui/badge.tsx`, `components/ui/card.tsx`) | 신규 설치 불필요, "영향 받는 파일" 표에도 New로 포함하지 않음 |

## 인프라 리소스

None — 외부 API는 공개 엔드포인트이며 API 키/환경변수가 필요 없다.

## 데이터 모델

### Game (도메인 타입, DB 없음)
- appid (number, required)
- name (string, required)
- thumbnailUrl (string, required)
- priceInitial (number, required) — KRW, 할인 없으면 priceFinal과 동일
- priceFinal (number, required) — KRW, 무료면 0
- discountPercent (number, required) — 할인 없으면 0
- reviewPercent (number | null, required) — 계산 불가 시 null
- reviewCount (number, required)
- tags (string[], required) — 우리가 지원하는 8개 장르 중 이 게임에 매칭되는 것만

### RecommendationBadge (파생값, 저장하지 않음)
- level: "적극추천" | "신중히고려" | "비추천" | "정보부족" — `reviewPercent`/`reviewCount`로부터 순수 함수로 계산

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | Task 2-5 | ToggleGroup/Skeleton/Empty 컴포넌트 추가, 기존 Badge/Card/Dialog 활용, semantic color·`cn()`·`gap-*`·`data-icon` 등 스타일링 규칙 준수 |
| next-best-practices | Task 1 | Route Handler(`route.ts`) 작성, fetch 캐싱, 런타임 선택 |
| vercel-react-best-practices | Task 2-5 | 불필요한 리렌더 방지 등 React/Next 성능 패턴 |
| vercel-composition-patterns | Task 2, Task 4 | 필터/카드/모달 컴포넌트 API 설계 |
| web-design-guidelines | Task 2-5 | 접근성·UX 가이드라인 준수 검토 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/game.ts` | New | Task 1 |
| `config/genres.ts` | New | Task 1 |
| `lib/steam-search-parser.ts` | New | Task 1 |
| `lib/steam-search-parser.test.ts` | New | Task 1 |
| `app/api/games/route.ts` | New | Task 1 |
| `app/api/games/__tests__/route.test.ts` | New | Task 1 |
| `hooks/use-games.ts` | New | Task 2 |
| `hooks/use-games.test.ts` | New | Task 2 |
| `components/genre-filter.tsx` | New | Task 2 |
| `components/genre-filter.test.tsx` | New | Task 2 |
| `components/game-card.tsx` | New | Task 2 |
| `components/game-card.test.tsx` | New | Task 2 |
| `components/game-grid.tsx` | New | Task 2, Task 3 |
| `components/game-grid.test.tsx` | New | Task 2, Task 3 |
| `components/ui/toggle-group.tsx` | New (shadcn add) | Task 2 |
| `components/ui/skeleton.tsx` | New (shadcn add) | Task 3 |
| `components/ui/empty.tsx` | New (shadcn add) | Task 3 |
| `app/page.tsx` | Modify (전면 교체) | Task 2, Task 4, Task 5 |
| `app/layout.tsx` | Modify (metadata 갱신) | Task 2 |
| `components/component-example.tsx` | Delete (미사용 데모 코드) | Task 2 |
| `components/example.tsx` | Delete (미사용 데모 코드) | Task 2 |
| `lib/recommendation-badge.ts` | New | Task 4 |
| `lib/recommendation-badge.test.ts` | New | Task 4 |
| `components/game-detail-modal.tsx` | New | Task 4 |
| `components/game-detail-modal.test.tsx` | New | Task 4 |
| `components/theme-toggle.tsx` | New | Task 5 |
| `components/theme-toggle.test.tsx` | New | Task 5 |
| `e2e/game-explorer.spec.ts` | New | Task 6 |
| `e2e/smoke.spec.ts` | Modify (제목 단언 갱신) | Task 2 |

## Tasks

### Task 1: 장르별 게임 목록 조회 API

- **담당 시나리오**: Scenario 1, 2, 3 (데이터 계층 — UI 없음, HTTP 응답으로 관찰) / Scenario 7 (부분 — 실패 시 에러 상태 코드 제공까지, 에러 UI 표시는 Task 3)
- **크기**: M (4 파일)
- **의존성**: None
- **참조**:
  - next-best-practices — route-handlers, runtime-selection
  - 외부 엔드포인트: `https://store.steampowered.com/search/results/?tags=<id>&category1=998&cc=kr&supportedlang=english&json=1&infinite=1&count=20` (tags 생략 시 "전체". `cc=kr` 없으면 서버 배포 리전에 따라 통화가 바뀔 수 있음 — 재현 테스트로 확인)
  - 검증된 장르→태그ID 매핑: Action=19, RPG=122, Indie=492, Strategy=9, Simulation=599, Adventure=21, Sports=701, Racing=699
- **구현 대상**:
  - `types/game.ts` — `Game` 타입
  - `config/genres.ts` — `GENRES`(label+steamTagId 배열), `GENRE_BY_TAG_ID`(역맵)
  - `lib/steam-search-parser.ts` — Steam 검색 응답의 `results_html`을 `Game[]`로 파싱 (appid: `data-ds-appid`, 이름: `class="title"`, 가격/할인: `discount_block`/`discount_original_price`/`discount_final_price`/`no_discount`, 리뷰: `data-tooltip-html`의 "N% ... M user reviews" 패턴, 태그: `data-ds-tagids`를 `GENRE_BY_TAG_ID`와 교차 비교)
  - `lib/steam-search-parser.test.ts` — 캡처된 fixture HTML(정상/할인/무료/리뷰부족 케이스 포함)로 파서 단위 테스트, 외부 네트워크 의존 없음
  - `app/api/games/route.ts` — `GET`, query param `genre`(기본값 "전체"), Steam 응답을 서버사이드로 fetch 후 파서 호출, `revalidate = 60`
  - `app/api/games/__tests__/route.test.ts` — 전역 `fetch`를 mock해 라우트 핸들러 응답 검증
- **수용 기준**:
  - [ ] `GET /api/games?genre=전체` 요청 → 200 응답과 최대 20개의 게임 배열(각 항목에 appid/name/thumbnailUrl/priceFinal/discountPercent/reviewPercent/reviewCount/tags 포함)이 반환된다
  - [ ] `GET /api/games?genre=RPG` 요청 → 반환된 모든 게임의 `tags`에 "RPG"가 포함된다
  - [ ] 리뷰 수가 10 미만인 게임의 응답 → `reviewPercent`가 `null`이다
  - [ ] 할인 중인 게임의 응답 → `discountPercent`가 0보다 크고 `priceInitial` > `priceFinal`이다
  - [ ] 무료가 아닌 게임의 응답 → 가격이 원화(KRW) 기준 값이다 (요청 URL에 `cc=kr` 포함 여부를 파서 테스트에서 검증)
  - [ ] Steam 응답 fetch가 실패하면 → 라우트가 4xx/5xx 상태 코드를 반환한다
- **검증**: `bun run test -- steam-search-parser route.test`

---

### Task 2: 목록 화면 — 장르 필터 + 카드 그리드

- **담당 시나리오**: Scenario 1 (full), Scenario 2 (full)
- **크기**: M (5 파일)
- **의존성**: Task 1 (`/api/games` 응답을 소비)
- **참조**:
  - shadcn — ToggleGroup, Card, Badge (Card/Badge는 이미 설치됨)
  - wireframe.html — 목록·전체, 목록·필터(RPG) 화면. 필터 칩 줄은 모바일에서 `overflow-x-auto`, `@md:` 이상에서 `flex-wrap`으로 감싸지는 레이아웃 — `ToggleGroup`을 이 wrapper 안에 배치
- **구현 대상**:
  - `hooks/use-games.ts` — `useGames(genre)`: `/api/games?genre=...` fetch, `{status: "loading"|"error"|"success", games}` 반환
  - `hooks/use-games.test.ts`
  - `components/genre-filter.tsx` — shadcn `ToggleGroup`(단일 선택)로 전체+8장르 칩
  - `components/genre-filter.test.tsx`
  - `components/game-card.tsx` — 순위번호, 썸네일, 이름, 가격/할인, 리뷰율, 장르 태그(`Badge`)
  - `components/game-card.test.tsx`
  - `components/game-grid.tsx` — 필터 상태 보관, `useGames` 연결, 카드 그리드 렌더 (로딩/에러/빈 상태는 Task 3에서 확장)
  - `components/game-grid.test.tsx`
  - `app/page.tsx` — `ComponentExample` 제거, `GenreFilter` + `GameGrid` 조립
  - `app/layout.tsx` — metadata를 "게임 탐색기"로 갱신 (기존 "Kanban Todo"는 이전 예제의 잔재)
  - `e2e/smoke.spec.ts` — 제목 단언을 갱신된 metadata로 수정
  - `components/component-example.tsx`, `components/example.tsx` 삭제 (더 이상 참조되지 않는 데모 코드)
- **수용 기준**:
  - [ ] 페이지 로드 완료 → "전체" 칩이 선택 상태로 표시되고, 순위 1번부터 시작하는 게임 카드들이 나열된다
  - [ ] 각 카드에 썸네일, 이름, 가격(할인 시 원가+할인가), 리뷰 긍정률 %, 장르 태그가 표시된다
  - [ ] "RPG" 칩 클릭 → 카드 목록이 RPG 게임들로 교체되고 "RPG" 칩이 선택 표시된다
  - [ ] 이어서 "Action" 칩 클릭 → 카드 목록이 Action 게임들로 교체되고 "RPG" 칩의 선택 표시는 사라진다
- **검증**: `bun run test -- use-games genre-filter game-card game-grid` + `bun run build`

---

### Task 3: 로딩 / 에러 / 결과 없음 상태

- **담당 시나리오**: Scenario 3 (full), Scenario 7 (full)
- **크기**: S (1 파일 수정 + shadcn 컴포넌트 추가)
- **의존성**: Task 2 (`game-grid.tsx` 확장)
- **참조**: shadcn — Skeleton, Empty. 에러 상태는 shadcn 컴포넌트가 아니라 직접 마크업(아이콘 + 텍스트 + `Button`)으로 구현 (wireframe.html의 "목록·에러" 화면 참조)
- **구현 대상**:
  - `bunx --bun shadcn@latest add skeleton empty` 실행
  - `components/game-grid.tsx` — `status`에 따라 `Skeleton` 카드(로딩) / 직접 마크업 에러 메시지+재시도 `Button` / `Empty`(결과없음) 분기 추가
  - `components/game-grid.test.tsx` — 위 분기 테스트 추가
- **수용 기준**:
  - [ ] 필터 조회 결과가 0개 → 카드 대신 "해당 장르의 게임을 찾지 못했습니다. 다른 장르를 선택해보세요" 문구가 표시된다
  - [ ] 데이터 요청 진행 중 → 스켈레톤 로딩 UI가 표시된다
  - [ ] 데이터 요청 실패 → "게임 정보를 불러오지 못했습니다" 메시지와 "다시 시도" 버튼이 표시된다
  - [ ] "다시 시도" 버튼 클릭 → 동일한 필터로 요청이 다시 실행된다
- **검증**: `bun run test -- game-grid`

---

### Checkpoint: Task 1-3 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 목록 화면(필터 → 카드 → 로딩/에러/빈 상태)이 실제 브라우저에서 end-to-end로 동작 — `bun dev` 후 수동 확인

---

### Task 4: 상세 모달 — 추천 배지 + 가격/리뷰 정보

- **담당 시나리오**: Scenario 4 (full), Scenario 5 (full), Scenario 6 (full)
- **크기**: M (3 파일)
- **의존성**: Task 2 (게임 카드 클릭 트리거)
- **참조**:
  - shadcn — Dialog (Title 필수)
  - wireframe.html — 모달·적극추천, 모달·비추천 화면
- **구현 대상**:
  - `lib/recommendation-badge.ts` — `getRecommendationBadge(reviewPercent, reviewCount)`: `reviewCount < 10` → "정보부족", `reviewPercent >= 80` → "적극추천", `>= 50` → "신중히고려", 그 외 → "비추천" (순수 함수)
  - `lib/recommendation-badge.test.ts`
  - `components/game-detail-modal.tsx` — shadcn `Dialog`, 배지(`Badge` variant로 4단계 구분: default/secondary/destructive/outline), 가격/할인, 리뷰율, `https://store.steampowered.com/app/{appid}` 링크(`target="_blank"`)
  - `components/game-detail-modal.test.tsx`
  - `app/page.tsx` — 카드 클릭 시 선택된 게임 상태 저장, 모달에 전달
- **수용 기준**:
  - [ ] 리뷰 긍정률 80% 이상 게임 클릭 → 모달에 "적극 추천" 배지가 표시된다
  - [ ] 리뷰 긍정률 50~79% 게임 클릭 → 모달에 "신중히 고려" 배지가 표시된다
  - [ ] 리뷰 긍정률 50% 미만 게임 클릭 → 모달에 "비추천" 배지가 표시된다
  - [ ] 리뷰 수 10 미만 게임 클릭 → 모달에 "정보 부족" 배지가 표시된다
  - [ ] 모달에는 항상 가격/할인 정보, 리뷰 긍정률 수치, Steam 페이지 링크가 함께 표시된다
  - [ ] 닫기(X) 버튼 클릭 → 모달이 사라지고 목록이 다시 보인다
  - [ ] 모달 바깥 영역 클릭 → 모달이 사라진다
  - [ ] ESC 키 입력 → 모달이 사라진다
  - [ ] "Steam에서 보기" 링크 클릭 → 새 탭에서 해당 게임의 Steam 스토어 페이지 URL로 이동한다
  - [ ] 카드에 표시된 리뷰 긍정률과 그 카드를 클릭해 연 모달의 리뷰 긍정률이 항상 동일한 값이다 (별도 API 재조회 없이 같은 `Game` 객체를 전달하는지 확인 — 불변 규칙 "데이터 일관성")
- **검증**: `bun run test -- recommendation-badge game-detail-modal`

---

### Task 5: 다크모드 토글

- **담당 시나리오**: Scenario 8 (full)
- **크기**: S (2 파일)
- **의존성**: Task 2 (`app/page.tsx`의 헤더 구조가 먼저 존재해야 `ThemeToggle`을 배치할 수 있음). `next-themes`의 `ThemeProvider`는 이미 `app/layout.tsx`에 설정되어 있어 추가 설정 불필요
- **참조**: `app/layout.tsx`의 기존 `ThemeProvider` 설정
- **구현 대상**:
  - `components/theme-toggle.tsx` — `useTheme()`(next-themes) 기반 토글 버튼
  - `components/theme-toggle.test.tsx`
  - `app/page.tsx` — 헤더에 `ThemeToggle` 배치
- **수용 기준**:
  - [ ] 토글 클릭 → 화면 전체 배색이 라이트↔다크로 전환된다
- **검증**: `bun run test -- theme-toggle`

---

### Checkpoint: Task 4-5 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 카드 클릭 → 모달 → 배지/가격/리뷰/링크 확인 → 닫기, 다크모드 토글까지 end-to-end로 동작 — `bun dev` 후 수동 확인

---

### Task 6: 전체 사용자 흐름 E2E

- **담당 시나리오**: Scenario 1-8 (통합 확인)
- **크기**: S (1 파일)
- **의존성**: Task 1-5 전체
- **참조**: 없음
- **구현 대상**:
  - `e2e/game-explorer.spec.ts` — `/api/games` 응답을 Playwright route 인터셉트로 스텁, "진입 → 필터 전환 → 카드 클릭 → 모달 확인 → 닫기 → 다크모드 토글" 흐름 1개 테스트
- **수용 기준**:
  - [ ] 전체 흐름이 실제 브라우저(Chromium)에서 한 번에 통과한다
- **검증**: `bun run test:e2e`

---

### Task 7: 랜덤 추천 버튼

- **담당 시나리오**: Scenario 9 (full)
- **크기**: M (3 파일)
- **의존성**: Task 2, Task 4 (게임 목록·상세 모달이 이미 존재해야 재사용 가능)
- **참조**: vercel-composition-patterns — `state-lift-state` (형제 컴포넌트인 목록과 랜덤 버튼이 같은 `games` 상태를 공유해야 하므로 `useGames` 호출을 `game-grid.tsx`에서 `app/page.tsx`로 끌어올림)
- **구현 대상**:
  - `hooks/use-games.ts` — 변경 없음 (재사용)
  - `components/game-grid.tsx` — `{genre, onSelectGame}` 대신 `{games, status, onSelectGame, onRetry}`를 받는 순수 표시 컴포넌트로 변경 (내부에서 더 이상 `useGames` 호출하지 않음)
  - `components/random-pick-button.tsx` — `games`/`status`를 props로 받아 목록이 비었거나 로딩/에러 상태면 비활성화, 클릭 시 무작위 게임을 골라 `onPick`으로 전달
  - `components/random-pick-button.test.tsx`
  - `app/page.tsx` — `useGames(genre)`를 직접 호출해 `games`/`status`를 `GameGrid`와 `RandomPickButton` 양쪽에 전달
- **수용 기준**:
  - [ ] 목록에 게임이 있는 상태에서 "랜덤 추천" 버튼 클릭 → 목록에 있는 게임 중 하나의 상세 모달이 열린다
  - [ ] 로딩 중 / 결과 0개 / 조회 실패 상태 → "랜덤 추천" 버튼이 비활성화된다
- **검증**: `bun run test -- random-pick-button game-grid page`

---

### Task 8: 게임 이름 검색

- **담당 시나리오**: Scenario 10 (full)
- **크기**: M (4 파일)
- **의존성**: Task 1 (API), Task 7 (`useGames`가 이미 `page.tsx`로 올라와 있음)
- **참조**:
  - 실측 확인: Steam 검색 엔드포인트가 `term=<검색어>` 파라미터를 지원하며 기존 `tags=<id>`와 함께 써도 AND로 결합됨 (`term=diablo&tags=122` → RPG 안에서 diablo만)
  - shadcn — Input (`type="search"`로 네이티브 지우기 버튼 활용)
- **아키텍처 결정 추가**: 검색어는 매 keystroke마다 요청하지 않고 `hooks/use-debounced-value.ts`로 400ms 디바운스한 뒤 `useGames`에 전달 — Steam에 매 타이핑마다 요청을 보내지 않기 위함
- **구현 대상**:
  - `hooks/use-debounced-value.ts` — 범용 디바운스 훅
  - `hooks/use-debounced-value.test.ts`
  - `hooks/use-games.ts` — `useGames(genre, search)`로 시그니처 확장, `search`가 있으면 요청 URL에 `search` 쿼리 파라미터 추가
  - `app/api/games/route.ts` — `search` 쿼리 파라미터를 읽어 Steam 요청 URL에 `term`으로 전달
  - `components/search-input.tsx` — `type="search"` 컨트롤드 인풋
  - `components/search-input.test.tsx`
  - `app/page.tsx` — 검색 입력 상태 + 디바운스된 값을 `useGames`에 연결
- **수용 기준**:
  - [ ] "전체" 필터에서 검색어 입력 → Steam 전체에서 이름이 일치하는 게임으로 목록이 좁혀진다
  - [ ] 특정 장르 필터에서 검색어 입력 → 그 장르 안에서 이름이 일치하는 게임만 남는다
  - [ ] 검색어를 지우면 → 검색 전 상태로 돌아간다
  - [ ] 일치하는 게임이 없으면 → 기존 "찾지 못했습니다" 안내(Scenario 3)가 그대로 표시된다
- **검증**: `bun run test -- use-debounced-value use-games route.test search-input page`

---

### Task 9: YouTube 트레일러 검색 링크

- **담당 시나리오**: Scenario 11 (full)
- **크기**: S (2 파일)
- **의존성**: Task 4 (상세 모달이 이미 존재해야 링크를 추가할 위치가 있음)
- **아키텍처 결정**: YouTube Data API 대신 키 없이 되는 `youtube.com/results?search_query=` 검색 링크로 대체 (사용자가 API 키 발급 없는 가벼운 버전을 선택함). 실제 영상 목록/썸네일은 하지 않음
- **구현 대상**:
  - `lib/youtube-search-url.ts` — `buildYoutubeSearchUrl(gameName)`: `<이름> trailer`를 인코딩해 검색 URL 생성하는 순수 함수
  - `lib/youtube-search-url.test.ts`
  - `components/game-detail-modal.tsx` — Steam 링크 아래에 "YouTube에서 트레일러 찾기" 링크 추가 (`target="_blank" rel="noreferrer"`)
- **수용 기준**:
  - [ ] 상세 모달에서 "YouTube에서 트레일러 찾기" 링크 클릭 → 새 탭에서 "<게임 이름> trailer" YouTube 검색 결과 URL이 열린다
- **검증**: `bun run test -- youtube-search-url game-detail-modal`

---

### Task 10: 즐겨찾기 (localStorage)

- **담당 시나리오**: Scenario 12, 13 (full)
- **크기**: M (5 파일)
- **의존성**: Task 2 (`GameGrid`/`GameCard`), Task 7 (`page.tsx`가 이미 `games` 상태를 들고 있음)
- **아키텍처 결정**:
  - 즐겨찾기는 appid만이 아니라 **`Game` 객체 전체**를 localStorage에 저장한다 — appid만 저장하면 즐겨찾기 화면을 그릴 때 그 게임을 다시 조회할 API가 없어서(현재 아키텍처는 장르/검색당 최대 20개만 가져옴), 마지막으로 본 가격·리뷰율이 다소 오래될 수 있음을 감수하고 전체 객체를 저장한다.
  - localStorage 접근은 `useEffect` 안에서만 한다 — `useState(initial)`을 `localStorage`로 초기화하면 서버가 알 수 없는 값이라 하이드레이션 불일치가 나므로, 항상 빈 배열로 시작해 마운트 후에 채운다 (`.claude/rules/browser-verify.md`가 지적한 것과 같은 유형의 함정을 피함).
  - `GameGrid`는 `games`/`status`를 그대로 받는 순수 컴포넌트라 즐겨찾기 목록도 동일하게 재사용 가능 (Task 7에서 끌어올린 구조 덕분에 추가 분기 없이 그대로 씀). 빈 상태 문구만 `emptyTitle`/`emptyDescription` prop으로 오버라이드 가능하게 확장한다.
- **구현 대상**:
  - `hooks/use-favorites.ts` — `{ favorites, isFavorite, toggleFavorite }`, localStorage 키 `game-explorer:favorites`
  - `hooks/use-favorites.test.ts`
  - `components/game-card.tsx` — 우상단에 하트 아이콘 버튼 추가 (`isFavorite`/`onToggleFavorite` props, `event.stopPropagation()`으로 카드 클릭과 분리)
  - `components/favorites-toggle.tsx` — 즐겨찾기 개수 표시 + 보기 전환 버튼
  - `components/favorites-toggle.test.tsx`
  - `components/game-grid.tsx` — `emptyTitle`/`emptyDescription` optional prop 추가 (기본값은 기존 문구 유지)
  - `app/page.tsx` — `viewMode: "browse" | "favorites"` state, `useFavorites` 연결, 즐겨찾기 화면일 때 `GameGrid`에 `favorites` 배열 전달
- **수용 기준**:
  - [ ] 즐겨찾기하지 않은 게임의 하트 클릭 → 하트가 채워지고, 새로고침 후에도 유지된다
  - [ ] 즐겨찾기된 게임의 하트 클릭 → 즐겨찾기에서 제거된다
  - [ ] 하트 클릭이 카드의 상세 모달 열기를 트리거하지 않는다
  - [ ] 즐겨찾기 2개 이상 상태에서 "즐겨찾기" 토글 클릭 → 장르와 무관하게 그 2개만 표시된다
  - [ ] 즐겨찾기가 없는 상태에서 토글 클릭 → "즐겨찾기한 게임이 없습니다" 안내가 표시된다
  - [ ] 토글을 다시 클릭 → 이전 탐색 화면(장르/검색 상태 유지)으로 돌아간다
- **검증**: `bun run test -- use-favorites game-card favorites-toggle game-grid page`

---

### Task 11: 게임 개수 확장 (20→50) + 장르 6개 추가

- **담당 시나리오**: Scenario 1, 2 (범위 확장, 새 시나리오 아님)
- **크기**: S (2 파일)
- **아키텍처 결정**: Task 1 당시 `count=20` 요청에 실제로는 25개가 와서 `.slice(0,20)`으로 강제했던 것과 달리, 이번에 `count=50`/`count=100`을 직접 실측하니 요청한 개수와 정확히 일치해 반환됨을 확인 — Steam이 작은 count 값에서만 최소 배치(약 25개)를 강제하는 것으로 추정. 장르 6개는 아래처럼 실측으로 태그ID를 검증했고, "Multiplayer/Singleplayer/Open World/Sci-fi" 등 기존 8개 장르와 겹침이 큰 후보는 제외하고 독보적인 것만 선정함.
  - 추가 검증된 장르→태그ID: Puzzle=1664, Horror=1667, Fighting=1743, Platformer=1625, Roguelike=1716, Anime=4085
- **구현 대상**:
  - `config/genres.ts` — `GENRES` 배열에 6개 항목 추가
  - `app/api/games/route.ts` — `count` 파라미터를 `"20"` → `"50"`으로, `.slice(0, 20)` → `.slice(0, 50)`으로 변경
- **수용 기준**:
  - [ ] `GET /api/games?genre=전체` 요청 → 최대 50개의 게임 배열이 반환된다
  - [ ] 새로 추가된 6개 장르 칩이 필터에 나타나고, 각각 클릭 시 해당 장르에 맞는 게임 목록으로 교체된다
- **검증**: `bun run test -- route.test genre-filter`

---

## 미결정 항목

없음 — 모든 구현 결정에 대한 근거를 실측 또는 기존 프로젝트 관례로 확정함
