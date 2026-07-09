import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameDetailModal } from "./game-detail-modal";
import type { Game } from "@/types/game";

const strongGame: Game = {
  appid: 1086940,
  name: "Baldur's Gate 3",
  thumbnailUrl: "https://shared.akamai.steamstatic.com/capsule.jpg",
  priceInitial: 66000,
  priceFinal: 66000,
  discountPercent: 0,
  reviewPercent: 96,
  reviewCount: 444334,
  tags: ["RPG"],
};

describe("GameDetailModal", () => {
  it("shows 적극 추천 badge, price, review percent, and a Steam link for a highly-rated game", () => {
    render(<GameDetailModal game={strongGame} onClose={vi.fn()} />);

    expect(screen.getByText("Baldur's Gate 3")).toBeInTheDocument();
    expect(screen.getByText("적극 추천")).toBeInTheDocument();
    expect(screen.getByText(/66,000/)).toBeInTheDocument();
    expect(screen.getByText(/96%/)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Steam/ });
    expect(link).toHaveAttribute(
      "href",
      "https://store.steampowered.com/app/1086940",
    );
    expect(link).toHaveAttribute("target", "_blank");

    const youtubeLink = screen.getByRole("link", { name: /YouTube/ });
    expect(youtubeLink).toHaveAttribute(
      "href",
      "https://www.youtube.com/results?search_query=Baldur's+Gate+3+trailer",
    );
    expect(youtubeLink).toHaveAttribute("target", "_blank");
  });

  it("shows 비추천 badge for a low review percent", () => {
    render(
      <GameDetailModal
        game={{ ...strongGame, reviewPercent: 41, reviewCount: 1200 }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("비추천")).toBeInTheDocument();
  });

  it("shows 정보 부족 badge when there are too few reviews", () => {
    render(
      <GameDetailModal
        game={{ ...strongGame, reviewPercent: null, reviewCount: 3 }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("정보 부족")).toBeInTheDocument();
  });

  it("renders nothing when game is null", () => {
    render(<GameDetailModal game={null} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<GameDetailModal game={strongGame} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<GameDetailModal game={strongGame} onClose={onClose} />);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the overlay outside the dialog is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <GameDetailModal game={strongGame} onClose={onClose} />,
    );

    const overlay = container.ownerDocument.querySelector(
      '[data-slot="dialog-overlay"]',
    );
    expect(overlay).not.toBeNull();
    await userEvent.click(overlay as Element);

    expect(onClose).toHaveBeenCalled();
  });
});
