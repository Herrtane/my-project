# 레이아웃/포지셔닝 변경은 브라우저로 확인한다

## 규칙

다음 중 하나라도 변경하면, 유닛 테스트(Vitest/Testing Library)가 전부 통과해도 **실제 브라우저(Preview MCP 등)에서 스크린샷으로 직접 확인**한다:

- `position: absolute/fixed/sticky`, `z-index`
- 컨테이너 쿼리(`@container`, `@md:`, `@lg:` 등) 또는 반응형 브레이크포인트
- CSS Grid/Flexbox 레이아웃 구조 변경

## 이유

jsdom은 실제 CSS 페인트·stacking context·컨테이너 쿼리를 계산하지 않는다. Testing Library 테스트는 DOM 구조와 텍스트 존재 여부만 검증하므로, 다음과 같은 버그를 놓친다:

- `@container` 조상 누락으로 반응형 그리드가 항상 1열로만 렌더 (game-explorer Task 2)
- `position: absolute` 배지가 z-index 없이 뒤에 오는 형제 엘리먼트에 완전히 가려짐 (game-explorer Task 4, code review에서 발견)

두 사례 모두 빌드와 테스트를 통과한 채로 실제 화면에서만 드러났다.

## 적용 방법

컴포넌트/페이지를 수정한 뒤, `mcp__Claude_Preview__preview_screenshot` 또는 동급 도구로 최소 1회 확인한다. 의심스러우면 `document.elementFromPoint()`로 특정 엘리먼트가 실제로 최상단에 그려지는지 직접 검증한다.
