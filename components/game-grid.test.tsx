import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameGrid } from "./game-grid";

function mockGamesResponse(games: unknown[]) {
  return { ok: true, json: async () => ({ games }) };
}

describe("GameGrid", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a ranked card list once games load", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockGamesResponse([
        {
          appid: 1,
          name: "Game One",
          thumbnailUrl: "https://shared.akamai.steamstatic.com/a.jpg",
          priceInitial: 0,
          priceFinal: 0,
          discountPercent: 0,
          reviewPercent: 90,
          reviewCount: 100,
          tags: [],
        },
        {
          appid: 2,
          name: "Game Two",
          thumbnailUrl: "https://shared.akamai.steamstatic.com/b.jpg",
          priceInitial: 1000,
          priceFinal: 1000,
          discountPercent: 0,
          reviewPercent: 80,
          reviewCount: 50,
          tags: [],
        },
      ]),
    );

    render(<GameGrid genre="전체" onSelectGame={vi.fn()} />);

    expect(await screen.findByText("Game One")).toBeInTheDocument();
    expect(screen.getByText("Game Two")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
