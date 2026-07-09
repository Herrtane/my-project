import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RandomPickButton } from "./random-pick-button";
import type { Game } from "@/types/game";

function game(overrides: Partial<Game> = {}): Game {
  return {
    appid: 1,
    name: "Game One",
    thumbnailUrl: "https://shared.akamai.steamstatic.com/a.jpg",
    priceInitial: 0,
    priceFinal: 0,
    discountPercent: 0,
    reviewPercent: 90,
    reviewCount: 100,
    tags: [],
    ...overrides,
  };
}

describe("RandomPickButton", () => {
  it("is disabled when status is loading", () => {
    render(<RandomPickButton games={[]} status="loading" onPick={vi.fn()} />);

    expect(screen.getByRole("button", { name: /랜덤 추천/ })).toBeDisabled();
  });

  it("is disabled when status is error", () => {
    render(<RandomPickButton games={[]} status="error" onPick={vi.fn()} />);

    expect(screen.getByRole("button", { name: /랜덤 추천/ })).toBeDisabled();
  });

  it("is disabled when the game list is empty", () => {
    render(<RandomPickButton games={[]} status="success" onPick={vi.fn()} />);

    expect(screen.getByRole("button", { name: /랜덤 추천/ })).toBeDisabled();
  });

  it("is enabled and calls onPick with one of the games when clicked", async () => {
    const games = [game({ appid: 1 }), game({ appid: 2 }), game({ appid: 3 })];
    const onPick = vi.fn();
    render(<RandomPickButton games={games} status="success" onPick={onPick} />);

    const button = screen.getByRole("button", { name: /랜덤 추천/ });
    expect(button).not.toBeDisabled();

    await userEvent.click(button);

    expect(onPick).toHaveBeenCalledTimes(1);
    const picked = onPick.mock.calls[0][0] as Game;
    expect(games.map((g) => g.appid)).toContain(picked.appid);
  });
});
