import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows a loading skeleton while the request is in flight", () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}));

    render(<GameGrid genre="전체" onSelectGame={vi.fn()} />);

    expect(screen.getAllByTestId("game-card-skeleton").length).toBeGreaterThan(0);
  });

  it("shows an error message with a retry button when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

    render(<GameGrid genre="전체" onSelectGame={vi.fn()} />);

    expect(await screen.findByText("게임 정보를 불러오지 못했습니다")).toBeInTheDocument();

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockGamesResponse([]));
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("shows an empty-state message when the filtered result has no games", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockGamesResponse([]));

    render(<GameGrid genre="Racing" onSelectGame={vi.fn()} />);

    expect(
      await screen.findByText("해당 장르의 게임을 찾지 못했습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("다른 장르를 선택해보세요.")).toBeInTheDocument();
  });
});
