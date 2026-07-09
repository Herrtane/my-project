import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameCard } from "./game-card";
import type { Game } from "@/types/game";

const baseGame: Game = {
  appid: 1623730,
  name: "Palworld",
  thumbnailUrl: "https://shared.akamai.steamstatic.com/capsule.jpg",
  priceInitial: 32000,
  priceFinal: 22400,
  discountPercent: 30,
  reviewPercent: 94,
  reviewCount: 152849,
  tags: ["Action", "Adventure"],
};

describe("GameCard", () => {
  it("renders rank, name, discounted price, review percent, and tags", () => {
    render(<GameCard game={baseGame} rank={2} onSelect={vi.fn()} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Palworld")).toBeInTheDocument();
    expect(screen.getByText(/32,000/)).toBeInTheDocument();
    expect(screen.getByText(/22,400/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
    expect(screen.getByText(/94%/)).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Adventure")).toBeInTheDocument();
  });

  it("shows 무료 for a free game", () => {
    render(
      <GameCard
        game={{ ...baseGame, priceInitial: 0, priceFinal: 0, discountPercent: 0 }}
        rank={1}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("무료")).toBeInTheDocument();
  });

  it("calls onSelect with the game when clicked", async () => {
    const onSelect = vi.fn();
    render(<GameCard game={baseGame} rank={2} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith(baseGame);
  });
});
