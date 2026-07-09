import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useFavorites } from "./use-favorites";
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

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts empty when localStorage has nothing saved", async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.favorites).toEqual([]));
  });

  it("adds a game to favorites and persists it to localStorage", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites).toEqual([]));

    act(() => result.current.toggleFavorite(game()));

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(1)).toBe(true);
    expect(JSON.parse(localStorage.getItem("game-explorer:favorites")!)).toHaveLength(1);
  });

  it("removes a game from favorites when toggled again", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites).toEqual([]));

    act(() => result.current.toggleFavorite(game()));
    act(() => result.current.toggleFavorite(game()));

    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorite(1)).toBe(false);
  });

  it("loads previously saved favorites from localStorage on mount", async () => {
    localStorage.setItem("game-explorer:favorites", JSON.stringify([game({ appid: 42 })]));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.favorites).toHaveLength(1));
    expect(result.current.isFavorite(42)).toBe(true);
  });
});
