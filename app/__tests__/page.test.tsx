import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../page";

function game(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    appid: 1,
    name: "Counter-Strike 2",
    thumbnailUrl: "https://shared.akamai.steamstatic.com/a.jpg",
    priceInitial: 0,
    priceFinal: 0,
    discountPercent: 0,
    reviewPercent: 86,
    reviewCount: 100,
    tags: ["Action"],
    ...overrides,
  };
}

describe("Page", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads with the 전체 chip selected and renders the initial game list", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ games: [game()] }),
    });

    render(<Page />);

    expect(screen.getByText("게임 탐색기")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "전체" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(await screen.findByText("Counter-Strike 2")).toBeInTheDocument();
  });

  it("swaps the game list when a different genre chip is clicked", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [game({ name: "Counter-Strike 2" })] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [game({ appid: 2, name: "Baldur's Gate 3" })] }),
      });

    render(<Page />);
    await screen.findByText("Counter-Strike 2");

    await userEvent.click(screen.getByRole("radio", { name: "RPG" }));

    expect(await screen.findByText("Baldur's Gate 3")).toBeInTheDocument();
    expect(screen.queryByText("Counter-Strike 2")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "RPG" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
