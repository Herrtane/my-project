import { expect, test } from "@playwright/test";

const ALL_GAMES = [
  {
    appid: 1,
    name: "Counter-Strike 2",
    thumbnailUrl: "https://shared.akamai.steamstatic.com/capsule.jpg",
    priceInitial: 0,
    priceFinal: 0,
    discountPercent: 0,
    reviewPercent: 96,
    reviewCount: 10000,
    tags: ["Action"],
  },
];

const RPG_GAMES = [
  {
    appid: 2,
    name: "Baldur's Gate 3",
    thumbnailUrl: "https://shared.akamai.steamstatic.com/capsule2.jpg",
    priceInitial: 66000,
    priceFinal: 49500,
    discountPercent: 25,
    reviewPercent: 96,
    reviewCount: 444334,
    tags: ["RPG"],
  },
];

test("전체 흐름: 진입 → 필터 전환 → 카드 클릭 → 모달 확인 → 닫기 → 다크모드 토글", async ({
  page,
}) => {
  await page.route("**/api/games**", async (route) => {
    const url = new URL(route.request().url());
    const genre = url.searchParams.get("genre");
    const games = genre === "RPG" ? RPG_GAMES : ALL_GAMES;
    await route.fulfill({ json: { games } });
  });

  await page.goto("/");

  await expect(page.getByText("게임 탐색기")).toBeVisible();
  await expect(page.getByRole("radio", { name: "전체" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByText("Counter-Strike 2")).toBeVisible();

  await page.getByRole("radio", { name: "RPG" }).click();
  await expect(page.getByText("Baldur's Gate 3")).toBeVisible();
  await expect(page.getByText("Counter-Strike 2")).not.toBeVisible();

  await page.getByRole("button", { name: /Baldur's Gate 3/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("적극 추천")).toBeVisible();
  await expect(dialog.getByText(/49,500/)).toBeVisible();
  await expect(dialog.getByText(/96%/)).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Steam/ })).toHaveAttribute(
    "href",
    "https://store.steampowered.com/app/2",
  );

  await page.getByRole("button", { name: /close/i }).click();
  await expect(dialog).not.toBeVisible();

  await page.getByRole("button", { name: "다크모드 토글" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
