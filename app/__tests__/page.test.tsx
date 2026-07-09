import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("loads with the 전체 chip selected and renders the initial game list", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ games: [game()] }),
    });

    render(<Page />);

    expect(screen.getByText("자~ 오늘 해볼 게임은?")).toBeInTheDocument();
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

  it("opens a detail modal with the same review percent shown on the card, then closes it", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ games: [game({ reviewPercent: 88 })] }),
    });

    render(<Page />);
    const card = await screen.findByRole("button", { name: /Counter-Strike 2/ });
    expect(card).toHaveTextContent("88%");

    await userEvent.click(card);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("88%");

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a detail modal for one of the listed games when 랜덤 추천 is clicked", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ games: [game()] }),
    });

    render(<Page />);
    await screen.findByRole("button", { name: /Counter-Strike 2/ });

    await userEvent.click(screen.getByRole("button", { name: /랜덤 추천/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Counter-Strike 2");
  });

  it("disables 랜덤 추천 while the list is loading", () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}));

    render(<Page />);

    expect(screen.getByRole("button", { name: /랜덤 추천/ })).toBeDisabled();
  });

  it("re-fetches with the search term (debounced) and keeps the current genre", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [game({ name: "Counter-Strike 2" })] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [game({ appid: 9, name: "Elden Ring" })] }),
      });

    render(<Page />);
    await screen.findByText("Counter-Strike 2");

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "elden" } });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const secondCallUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[1][0] as string;
    expect(secondCallUrl).toContain("search=elden");
    expect(secondCallUrl).toContain(`genre=${encodeURIComponent("전체")}`);
    expect(await screen.findByText("Elden Ring")).toBeInTheDocument();
  });

  it("favoriting a card shows it in the 즐겨찾기 view regardless of the current genre", async () => {
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

    await userEvent.click(screen.getByRole("button", { name: "즐겨찾기 토글" }));

    await userEvent.click(screen.getByRole("radio", { name: "RPG" }));
    await screen.findByText("Baldur's Gate 3");

    await userEvent.click(screen.getByRole("button", { name: /즐겨찾기 보기/ }));

    expect(screen.getByText("Counter-Strike 2")).toBeInTheDocument();
    expect(screen.queryByText("Baldur's Gate 3")).not.toBeInTheDocument();
  });

  it("shows a favorites-specific empty message and returns to browse view on toggle", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ games: [game()] }),
    });

    render(<Page />);
    await screen.findByText("Counter-Strike 2");

    await userEvent.click(screen.getByRole("button", { name: /즐겨찾기 보기/ }));

    expect(
      await screen.findByText("즐겨찾기한 게임이 없습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Counter-Strike 2")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /즐겨찾기 보기/ }));

    expect(await screen.findByText("Counter-Strike 2")).toBeInTheDocument();
  });
});
