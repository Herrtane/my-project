"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game } from "@/types/game";

export type GamesStatus = "loading" | "error" | "success";

interface UseGamesResult {
  games: Game[];
  status: GamesStatus;
  refetch: () => void;
}

export function useGames(genre: string, search: string = ""): UseGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [status, setStatus] = useState<GamesStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    const params = new URLSearchParams({ genre });
    if (search.trim()) {
      params.set("search", search.trim());
    }

    fetch(`/api/games?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((data: { games: Game[] }) => {
        if (cancelled) return;
        setGames(data.games);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [genre, search, attempt]);

  const refetch = useCallback(() => setAttempt((a) => a + 1), []);

  return { games, status, refetch };
}
