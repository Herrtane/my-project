import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGames } from "./use-games";

describe("useGames", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading status then transitions to success with games", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ games: [{ appid: 1, name: "Test Game" }] }),
    });

    const { result } = renderHook(() => useGames("전체"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.games).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`genre=${encodeURIComponent("전체")}`),
    );
  });

  it("transitions to error status when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useGames("전체"));

    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("refetch triggers a new request", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ games: [] }),
    });

    const { result } = renderHook(() => useGames("전체"));
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => result.current.refetch());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("re-fetches when the genre argument changes", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ games: [] }),
    });

    const { rerender } = renderHook(({ genre }) => useGames(genre), {
      initialProps: { genre: "전체" },
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    rerender({ genre: "RPG" });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[1][0]).toContain("genre=RPG");
  });
});
