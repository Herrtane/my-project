import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameGrid } from "./game-grid";
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

describe("GameGrid", () => {
  it("renders a ranked card list when status is success", () => {
    render(
      <GameGrid
        games={[game(), game({ appid: 2, name: "Game Two" })]}
        status="success"
        onSelectGame={vi.fn()}
        onRetry={vi.fn()}
        isFavorite={() => false}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByText("Game One")).toBeInTheDocument();
    expect(screen.getByText("Game Two")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows a loading skeleton when status is loading", () => {
    render(
      <GameGrid
        games={[]}
        status="loading"
        onSelectGame={vi.fn()}
        onRetry={vi.fn()}
        isFavorite={() => false}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("game-card-skeleton").length).toBeGreaterThan(0);
  });

  it("shows an error message with a retry button when status is error", async () => {
    const onRetry = vi.fn();
    render(
      <GameGrid
        games={[]}
        status="error"
        onSelectGame={vi.fn()}
        onRetry={onRetry}
        isFavorite={() => false}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByText("게임 정보를 불러오지 못했습니다")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(onRetry).toHaveBeenCalled();
  });

  it("shows a default empty-state message when status is success with no games", () => {
    render(
      <GameGrid
        games={[]}
        status="success"
        onSelectGame={vi.fn()}
        onRetry={vi.fn()}
        isFavorite={() => false}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(
      screen.getByText("해당 장르의 게임을 찾지 못했습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("다른 장르를 선택해보세요.")).toBeInTheDocument();
  });

  it("shows a custom empty-state message when provided", () => {
    render(
      <GameGrid
        games={[]}
        status="success"
        onSelectGame={vi.fn()}
        onRetry={vi.fn()}
        isFavorite={() => false}
        onToggleFavorite={vi.fn()}
        emptyTitle="즐겨찾기한 게임이 없습니다."
        emptyDescription="카드의 하트 아이콘을 눌러 추가해보세요."
      />,
    );

    expect(screen.getByText("즐겨찾기한 게임이 없습니다.")).toBeInTheDocument();
    expect(
      screen.getByText("카드의 하트 아이콘을 눌러 추가해보세요."),
    ).toBeInTheDocument();
  });

  it("passes isFavorite through to each card's favorite toggle", () => {
    render(
      <GameGrid
        games={[game()]}
        status="success"
        onSelectGame={vi.fn()}
        onRetry={vi.fn()}
        isFavorite={(appid) => appid === 1}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /즐겨찾기/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
