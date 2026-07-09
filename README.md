# 자~ 오늘 해볼 게임은? (Game Explorer)

> Steam 인기 게임을 장르별로 탐색하고, 리뷰 데이터 기반 추천 배지로 "살까 말까"를 바로 판단할 수 있게 도와주는 웹 앱.

Steam 공식 스토어의 검색 결과를 서버에서 직접 파싱해 장르별 인기 게임 리스트를 보여주고, 게임 하나를 클릭하면 리뷰 긍정률을 기준으로 4단계 구매 추천 배지를 매겨줍니다. 별도 API 키나 로그인 없이 동작합니다.

## 주요 기능

- **장르 필터 15종** (Action, RPG, Horror, Roguelike, Anime 등) + **게임 이름 검색** — 두 조건을 조합해서 좁혀볼 수 있음
- **구매 추천 배지** — 리뷰 긍정률 기준 적극 추천 / 신중히 고려 / 비추천 / 정보 부족 4단계, 가격·할인 정보와 Steam 스토어 링크 포함
- **YouTube 트레일러 검색 링크** — 상세 모달에서 바로 연결
- **랜덤 추천 버튼** — 현재 필터 조건 내에서 무작위로 게임 하나 선택
- **즐겨찾기** — 로그인 없이 브라우저에 저장, 장르와 무관하게 모아보기
- **다크모드**, 로딩/에러/빈 결과 상태 처리

## 기술 스택

- **Framework**: Next.js 16 (App Router, Route Handler로 Steam 검색 페이지를 서버에서 프록시·파싱)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- **Icons**: Lucide React
- **Testing**: Vitest, Testing Library, Playwright (90여 개 테스트)
- **Package Manager**: Bun

### 데이터 소스

Steam은 이 규모의 용도에 맞는 공식 검색 API를 제공하지 않아, `store.steampowered.com`의 검색 결과 HTML을 서버(`app/api/games/route.ts`)에서 직접 fetch해 파싱합니다(`lib/steam-search-parser.ts`). 브라우저에서 직접 호출하면 CORS로 막히기 때문에 Next.js Route Handler를 프록시로 둡니다. 장르는 Steam의 태그 ID를, 검색은 `term` 파라미터를 사용하며 둘은 AND로 결합됩니다.

## 시작하기

```bash
bun install
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

E2E 테스트를 처음 실행하기 전에 Chromium을 설치합니다:

```bash
bunx playwright install chromium
```

## 스크립트

| 명령어 | 설명 |
|---|---|
| `bun dev` | 개발 서버 실행 |
| `bun run build` | 프로덕션 빌드 |
| `bun start` | 프로덕션 서버 실행 |
| `bun run lint` | ESLint 실행 |
| `bun run test` | Vitest 실행 |
| `bun run test:watch` | Vitest 워치 모드 |
| `bun run test:e2e` | Playwright E2E 실행 |

## Hooks

Claude Code hooks 기반 자동 품질 게이트 (`.claude/settings.json`)

| 단계 | 트리거 | 동작 |
|---|---|---|
| **WorktreeCreate** | 워크트리 생성 | `worktree-create.sh` — main 동기화, `.env` 복사, 의존성 설치 |
| **PostToolUse** | `Write\|Edit` | `lint-fix.sh` — ESLint auto-fix |

## 테스트 파일 컨벤션

| 파일 패턴 | 용도 |
|---|---|
| `*.test.tsx` / `*.test.ts` | 단위·통합·수용 기준 테스트 (Vitest, colocated) |
| `*.spec.ts` | E2E 테스트 (Playwright, `e2e/`) |

자세한 테스팅 원칙과 Stack은 [CLAUDE.md → Testing](./CLAUDE.md#testing)을 참조합니다.

## 개발 과정

이 프로젝트는 [Claude Hunt](https://www.claude-hunt.com) 강의의 spec-driven 워크플로우(`/idea-refine` → `/write-spec` → `/sketch-wireframe` → `/draft-plan` → `/execute-plan` → `/compound`)로 만들었습니다. 아이디어 정리부터 spec, 구현 계획, 회고까지의 전체 기록은 [`artifacts/game-explorer/`](./artifacts/game-explorer/)에 있습니다.
